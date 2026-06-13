const fs = require('fs');
let content = fs.readFileSync('src/pages/ClientDashboard.tsx', 'utf-8');

const startIdx = content.indexOf('<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-24 xl:pb-0">');
const endMarker = '</div>\n                  );\n                })}\n              </div>';
const endIdx = content.indexOf(endMarker, startIdx) + endMarker.length;


const replacement = `<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24 xl:pb-0">
                {products.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => {
                  return (
                    <div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-surface p-3 rounded-[16px] border border-border-color hover:border-brand-accent/30 hover:shadow-[0_8px_30px_rgb(37,99,235,0.06)] flex flex-col gap-3 shadow-sm group transition-all duration-300 cursor-pointer">
                      {product.imageUrl ? (
                        <div className="w-full aspect-square bg-surface-alt rounded-[12px] overflow-hidden border border-border-color shrink-0 relative">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          {(product.videoBase64 || product.additionalImage1 || product.sizes?.length > 0 || product.colors?.length > 0) && (
                            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded font-bold transition-opacity text-center leading-tight">Подробнее</div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full aspect-square bg-surface-alt rounded-[12px] flex items-center justify-center border border-border-color text-text-muted shrink-0 text-center">
                          <span className="text-[10px] uppercase font-bold opacity-30">Нет фото</span>
                        </div>
                      )}
                      
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-text-main font-bold text-[13px] leading-tight mb-1 line-clamp-2">{product.name}</h3>
                        
                        <div className="mt-auto pt-2 flex flex-col gap-2">
                          <div className="text-text-main font-black text-[14px] tracking-tight">
                            {(product.price || 0).toLocaleString()} UZS
                          </div>
                          
                          {product.stock > 0 ? (
                            <div className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover text-center py-2 rounded-lg text-[12px] font-bold shadow-sm transition-colors">
                              Выбрать
                            </div>
                          ) : (
                            <div className="w-full bg-surface-alt text-text-muted text-center py-2 rounded-lg text-[12px] font-bold border border-border-color opacity-70">
                              Нет в наличии
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>`;

if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + replacement + content.slice(endIdx);
  fs.writeFileSync('src/pages/ClientDashboard.tsx', content);
  console.log("REPLACED GRID!");
} else {
  console.log("MARKERS NOT FOUND");
}
