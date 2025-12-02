<script lang="ts">
	let { currentPage = $bindable(1), totalPages = 1, onPageChange } = $props();

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			currentPage = page;
			if (onPageChange) {
				onPageChange(page);
			}
		}
	}

	function goToPrevious() {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		}
	}

	function goToNext() {
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		}
	}

	// Calculate which page numbers to show
	const pageNumbers = $derived.by(() => {
		const pages: (number | string)[] = [];
		const maxVisible = 7;
		
		if (totalPages <= maxVisible) {
			// Show all pages if total is less than max visible
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);
			
			if (currentPage <= 4) {
				// Near the start
				for (let i = 2; i <= 5; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 3) {
				// Near the end
				pages.push('...');
				for (let i = totalPages - 4; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				// In the middle
				pages.push('...');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push('...');
				pages.push(totalPages);
			}
		}
		
		return pages;
	});
</script>

{#if totalPages > 1}
	<div class="pagination">
		<button 
			class="pagination-btn prev" 
			onclick={goToPrevious}
			disabled={currentPage === 1}
			aria-label="Previous page"
		>
			← Previous
		</button>
		
		<div class="page-numbers">
			{#each pageNumbers as pageNum}
				{#if typeof pageNum === 'string'}
					<span class="ellipsis">{pageNum}</span>
				{:else}
					<button
						class="page-number"
						class:active={pageNum === currentPage}
						onclick={() => goToPage(pageNum)}
						aria-label="Go to page {pageNum}"
						aria-current={pageNum === currentPage ? 'page' : undefined}
					>
						{pageNum}
					</button>
				{/if}
			{/each}
		</div>
		
		<button 
			class="pagination-btn next" 
			onclick={goToNext}
			disabled={currentPage === totalPages}
			aria-label="Next page"
		>
			Next →
		</button>
	</div>
{/if}

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 2rem;
		padding: 1rem 0;
	}

	.pagination-btn {
		background: #667eea;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		font-size: 0.9rem;
		transition: background 0.2s, transform 0.1s;
		min-width: 100px;
	}

	.pagination-btn:hover:not(:disabled) {
		background: #5568d3;
		transform: translateY(-1px);
	}

	.pagination-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: #ccc;
	}

	.page-numbers {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.page-number {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		font-size: 0.9rem;
		min-width: 40px;
		transition: all 0.2s;
	}

	.page-number:hover:not(.active) {
		background: #f0f0ff;
		transform: translateY(-1px);
	}

	.page-number.active {
		background: #667eea;
		color: white;
		border-color: #667eea;
	}

	.ellipsis {
		padding: 0.5rem 0.25rem;
		color: #999;
		user-select: none;
	}

	@media (max-width: 768px) {
		.pagination {
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.pagination-btn {
			min-width: 80px;
			padding: 0.5rem 0.75rem;
			font-size: 0.85rem;
		}

		.page-number {
			min-width: 36px;
			padding: 0.4rem 0.6rem;
			font-size: 0.85rem;
		}

		.page-numbers {
			order: 3;
			width: 100%;
			justify-content: center;
			margin-top: 0.5rem;
		}
	}
</style>

