import { useState, useEffect } from 'preact/hooks';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

interface Crumb {
  id: string;
  name: string;
}

async function fetchFolder(folderId: string, apiKey: string): Promise<DriveItem[]> {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = 'files(id,name,mimeType,webViewLink)';
  const url =
    `https://www.googleapis.com/drive/v3/files` +
    `?q=${q}&key=${apiKey}&fields=${fields}&orderBy=folder,name&pageSize=200`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ${res.status} ao acessar o acervo.`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.files ?? [];
}

// Phosphor icons — regular weight, 256×256 viewBox
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
    <path d={d} />
  </svg>
);

const P = {
  folder:    'M216,72H131.31L104,44.69A15.86,15.86,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.4,15.4,0,0,0,39.38,216H216.89A15.14,15.14,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM216,200H40V56H92.69l27.31,27.31A16,16,0,0,0,131.31,88H216Z',
  file:      'M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Zm0,32H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Z',
  grid:      'M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48ZM104,136H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z',
  search:    'M229.66,218.34l-50.07-50.07a88.21,88.21,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.31ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z',
  caretL:    'M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z',
  caretR:    'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z',
};

interface Props {
  rootFolderId: string;
  apiKey: string;
  rootName?: string;
}

export default function AcervoBrowser({ rootFolderId, apiKey, rootName = 'Students Hub' }: Props) {
  const [history, setHistory] = useState<Crumb[][]>([[{ id: rootFolderId, name: rootName }]]);
  const [histIdx, setHistIdx] = useState(0);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const crumbs = history[histIdx];
  const folderId = crumbs[crumbs.length - 1].id;
  const canBack = histIdx > 0;
  const canForward = histIdx < history.length - 1;

  useEffect(() => {
    if (!apiKey || !folderId) {
      setLoading(false);
      setError('Configure PUBLIC_GOOGLE_API_KEY e PUBLIC_ACERVO_ROOT_FOLDER_ID no arquivo .env');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSearch('');
    fetchFolder(folderId, apiKey)
      .then(data => { if (!cancelled) setItems(data); })
      .catch(e => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [folderId, apiKey]);

  function push(newCrumbs: Crumb[]) {
    const newHistory = history.slice(0, histIdx + 1).concat([newCrumbs]);
    setHistory(newHistory);
    setHistIdx(newHistory.length - 1);
  }

  function enterFolder(item: DriveItem) {
    push([...crumbs, { id: item.id, name: item.name }]);
  }

  function goToCrumb(idx: number) {
    if (idx === crumbs.length - 1) return;
    push(crumbs.slice(0, idx + 1));
  }

  const filtered = items.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div class="border border-[#262626] rounded-xl overflow-hidden bg-[#0f0f0f] card-3d">
      {/* Toolbar */}
      <div class="flex items-center justify-between gap-4 px-4 py-3 bg-[#141414] border-b border-[#262626] flex-wrap">
        <div class="flex items-center gap-2 min-w-0">
          <button
            onClick={() => canBack && setHistIdx(i => i - 1)}
            disabled={!canBack}
            aria-label="Voltar"
            class={`btn-icon-3d w-7 h-7 ${canBack ? 'text-white' : 'text-[#3a3a3a] !shadow-none cursor-default'}`}
          >
            <Icon d={P.caretL} size={14} />
          </button>
          <button
            onClick={() => canForward && setHistIdx(i => i + 1)}
            disabled={!canForward}
            aria-label="Avançar"
            class={`btn-icon-3d w-7 h-7 ${canForward ? 'text-white' : 'text-[#3a3a3a] !shadow-none cursor-default'}`}
          >
            <Icon d={P.caretR} size={14} />
          </button>

          <nav class="flex items-center flex-wrap gap-1 text-sm">
            {crumbs.map((crumb, i) => (
              <span key={crumb.id + String(i)} class="flex items-center gap-1">
                {i > 0 && <span class="text-[#3a3a3a]"><Icon d={P.caretR} size={12} /></span>}
                <button
                  onClick={() => goToCrumb(i)}
                  class={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                    i === crumbs.length - 1
                      ? 'bg-[#262626] text-white cursor-default'
                      : 'text-[#777] hover:text-white hover:bg-[#1e1e1e]'
                  }`}
                >
                  <Icon d={i === 0 ? P.grid : P.folder} size={14} />
                  <span>{crumb.name}</span>
                </button>
              </span>
            ))}
          </nav>
        </div>

        <div class="flex items-center gap-2 bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
          <input
            type="text"
            placeholder="Pesquisar no acervo"
            value={search}
            onInput={e => setSearch((e.target as HTMLInputElement).value)}
            class="bg-transparent text-sm text-white placeholder:text-[#555] outline-none w-40"
          />
          <span class="text-[#555]"><Icon d={P.search} size={14} /></span>
        </div>
      </div>

      <div class="divide-y divide-[#1a1a1a]">
        {loading && <div class="py-12 text-center text-[#555] text-sm">Carregando...</div>}
        {error && <div class="py-12 text-center text-red-400/70 text-sm px-6">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div class="py-12 text-center text-[#555] text-sm">
            {search ? 'Nenhum resultado.' : 'Pasta vazia.'}
          </div>
        )}
        {!loading && !error && filtered.map(item => {
          const isFolder = item.mimeType === FOLDER_MIME;
          return (
            <div
              key={item.id}
              class="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] cursor-pointer transition-colors"
              onClick={() => {
                if (isFolder) enterFolder(item);
                else if (item.webViewLink) window.open(item.webViewLink, '_blank', 'noopener,noreferrer');
              }}
            >
              <span class="text-[#666]"><Icon d={isFolder ? P.folder : P.file} size={16} /></span>
              <span class="text-sm text-[#e0e0e0]">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
