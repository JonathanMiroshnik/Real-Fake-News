import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SlopMeter from '../SlopMeter.tsx';
import { getSlopMeterTone } from '../slopMeterTone.ts';
import { notifySlopMeterChanged } from '../../../hooks/useSlopMeter.ts';

vi.mock('../../../config/apiConfig', () => ({
  getApiBaseUrlWithPrefix: () => '/api',
}));

function mockReading(model: string, intelligence: number) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true, reading: { model, intelligence } }),
  } as Response;
}

describe('SlopMeter', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getSlopMeterTone', () => {
    it('is red at or below 33', () => {
      expect(getSlopMeterTone(0)).toBe('low');
      expect(getSlopMeterTone(33)).toBe('low');
    });

    it('is yellow between 34 and 66', () => {
      expect(getSlopMeterTone(34)).toBe('medium');
      expect(getSlopMeterTone(66)).toBe('medium');
    });

    it('is green from 67 up', () => {
      expect(getSlopMeterTone(67)).toBe('high');
      expect(getSlopMeterTone(100)).toBe('high');
    });
  });

  it('draws the bar from the backend reading with the label beneath it', async () => {
    fetchMock.mockResolvedValue(mockReading('deepseek-chat', 64));
    render(<SlopMeter />);

    const meter = screen.getByRole('meter', { name: 'Current article writing intelligence' });
    await waitFor(() => expect(meter).toHaveAttribute('aria-valuenow', '64'));

    expect(meter.querySelector('.slop-meter-fill')).toHaveClass('slop-meter-fill-medium');
    expect(screen.getByText('Current article writing intelligence')).toBeInTheDocument();
  });

  it('shows the model name from the backend in the info popup', async () => {
    fetchMock.mockResolvedValue(mockReading('deepseek-coder', 41));
    render(<SlopMeter />);

    await waitFor(() => expect(screen.getByText('deepseek-coder')).toBeInTheDocument());
  });

  it('reaches the popup by keyboard, not only by hover', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(mockReading('deepseek-reasoner', 88));
    render(<SlopMeter />);

    await waitFor(() => expect(screen.getByText('deepseek-reasoner')).toBeInTheDocument());

    const infoButton = screen.getByRole('button', { name: /model/i });
    await user.tab();

    expect(infoButton).toHaveFocus();
    expect(infoButton).toHaveAttribute('aria-describedby', 'slop-meter-popup');
  });

  it('re-fetches and re-tints when the meter is told the value changed', async () => {
    fetchMock.mockResolvedValueOnce(mockReading('deepseek-coder', 41));
    render(<SlopMeter />);

    const meter = screen.getByRole('meter');
    await waitFor(() => expect(meter).toHaveAttribute('aria-valuenow', '41'));
    expect(meter.querySelector('.slop-meter-fill')).toHaveClass('slop-meter-fill-medium');

    fetchMock.mockResolvedValueOnce(mockReading('deepseek-reasoner', 88));
    act(() => notifySlopMeterChanged());

    await waitFor(() => expect(meter).toHaveAttribute('aria-valuenow', '88'));
    expect(meter.querySelector('.slop-meter-fill')).toHaveClass('slop-meter-fill-high');
  });

  it('renders an empty bar when the backend is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    render(<SlopMeter />);

    await waitFor(() => expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0'));
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });
});
