import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import PresenceIndicator from '../PresenceIndicator';

/**
 * Renders the indicator against a stubbed service layer, which is where its three
 * states come from. The assertions are about meaning, not colour:
 *
 * - a failed request must not render as "all fine" — the grey state exists for it;
 * - "Next edition in progress" only appears when the API says content is being
 *   generated, because that claim is what the owner asked to be honest about;
 * - the element is a live region, since the text changes on its own.
 */
const { mockSendHeartbeat, mockFetchGenerationStatus } = vi.hoisted(() => ({
  mockSendHeartbeat: vi.fn(),
  mockFetchGenerationStatus: vi.fn(),
}));

// Relative to *this* file, one level deeper than the component, so the specifier the
// component uses (`../../services/presenceService`) needs three `../` here.
vi.mock('../../../services/presenceService', () => ({
  sendHeartbeat: mockSendHeartbeat,
  fetchGenerationStatus: mockFetchGenerationStatus,
}));

const SNAPSHOT = { count: 5, ttlMilliseconds: 45_000, heartbeatIntervalMilliseconds: 15_000 };

function buildGenerationStatus(isGenerating: boolean) {
  return {
    lastGeneratedAt: '2026-11-17T11:00:00.000Z',
    isGenerating,
  };
}

function renderIndicator() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <PresenceIndicator />
    </MemoryRouter>,
  );
}

describe('PresenceIndicator', () => {
  beforeEach(() => {
    // `reset`, not `clear`: both stubs must lose the previous test's return value,
    // and each test then sets its own.
    vi.resetAllMocks();
  });

  it('shows the reader count and a live region', async () => {
    mockSendHeartbeat.mockResolvedValue(SNAPSHOT);
    mockFetchGenerationStatus.mockResolvedValue(buildGenerationStatus(false));

    renderIndicator();

    await waitFor(() => expect(screen.getByText('5 readers')).toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveAttribute('data-presence-status', 'green');
  });

  it('says nothing about generation while content is fresh', async () => {
    mockSendHeartbeat.mockResolvedValue(SNAPSHOT);
    mockFetchGenerationStatus.mockResolvedValue(buildGenerationStatus(false));

    renderIndicator();

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveAttribute('data-presence-status', 'green'),
    );
    expect(screen.queryByText(/next edition/i)).not.toBeInTheDocument();
  });

  it('announces the next edition while content is being generated', async () => {
    mockSendHeartbeat.mockResolvedValue(SNAPSHOT);
    mockFetchGenerationStatus.mockResolvedValue(buildGenerationStatus(true));

    renderIndicator();

    await waitFor(() =>
      expect(screen.getByText(/next edition in progress/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole('status')).toHaveAttribute('data-presence-status', 'yellow');
  });

  it('uses the singular for one reader', async () => {
    mockSendHeartbeat.mockResolvedValue({ ...SNAPSHOT, count: 1 });
    mockFetchGenerationStatus.mockResolvedValue(buildGenerationStatus(false));

    renderIndicator();

    await waitFor(() => expect(screen.getByText('1 reader')).toBeInTheDocument());
  });

  it('reports "unavailable" rather than green when the API fails', async () => {
    mockSendHeartbeat.mockResolvedValue(null);
    mockFetchGenerationStatus.mockResolvedValue(null);

    renderIndicator();

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveAttribute('data-presence-status', 'unknown'),
    );
    expect(screen.getByText(/status unavailable/i)).toBeInTheDocument();
    // The count is unknown, so no number is invented.
    expect(screen.queryByText(/\d+ readers?/)).not.toBeInTheDocument();
  });
});
