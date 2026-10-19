type PagerProps = {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
};

export function Pager({ page, pageCount, total, pageSize, onPage }: PagerProps) {
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  return (
    <footer>
      <button type="button" disabled={page === 0} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span>
        {from}–{to} of {total.toLocaleString()} · page {page + 1} of {pageCount}
      </span>
      <button
        type="button"
        disabled={page + 1 >= pageCount}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </footer>
  );
}
