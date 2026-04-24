import { useState } from 'preact/hooks';

export interface Book {
  id: string;
  name: string;
  webViewLink: string;
  path?: string;
}

interface Props {
  books: Book[];
  perPage?: number;
}

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
    <path d={d} />
  </svg>
);

const P = {
  file:   'M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Zm0,32H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Z',
  search: 'M229.66,218.34l-50.07-50.07a88.21,88.21,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.31ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z',
  caretL: 'M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z',
  caretR: 'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z',
};

export default function LivrosSearch({ books, perPage = 20 }: Props) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = books.filter(b =>
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * perPage, current * perPage);

  function handleSearch(e: Event) {
    setQuery((e.target as HTMLInputElement).value);
    setPage(1);
  }

  return (
    <div class="flex flex-col gap-5">
      <div class="flex items-center gap-2 border border-[#262626] rounded-lg px-4 py-2.5 w-72">
        <input
          type="text"
          placeholder="Pesquisar livro"
          value={query}
          onInput={handleSearch}
          class="bg-transparent text-sm text-white placeholder:text-[#555] outline-none flex-1"
        />
        <span class="text-[#555]"><Icon d={P.search} size={14} /></span>
      </div>

      <div class="border border-[#262626] rounded-xl overflow-hidden card-3d">
        {pageItems.length === 0 ? (
          <div class="py-12 text-center text-[#555] text-sm">
            {query ? 'Nenhum resultado.' : 'Nenhum livro cadastrado.'}
          </div>
        ) : (
          <div class="divide-y divide-[#1a1a1a]">
            {pageItems.map(book => (
              <a
                key={book.id}
                href={book.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
              >
                <span class="text-[#666]"><Icon d={P.file} size={16} /></span>
                <span class="text-sm text-[#e0e0e0]">{book.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <div class="flex items-center justify-end gap-3">
        <span class="text-sm text-[#666]">{current} de {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={current === 1}
          class={`btn-icon-3d w-8 h-8 ${current === 1 ? 'text-[#3a3a3a] !shadow-none cursor-default' : 'text-white'}`}
        >
          <Icon d={P.caretL} size={14} />
        </button>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={current === totalPages}
          class={`btn-icon-3d w-8 h-8 ${current === totalPages ? 'text-[#3a3a3a] !shadow-none cursor-default' : 'text-white'}`}
        >
          <Icon d={P.caretR} size={14} />
        </button>
      </div>
    </div>
  );
}
