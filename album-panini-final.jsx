import React, { useState, useEffect } from 'react';

const AlbumPanini = () => {
  // ALBUM PANINI
  const [selecao, setSelecao] = useState('Brasil');
  const [figurinhas, setFigurinhas] = useState({});
  const [filtroAlbum, setFiltroAlbum] = useState('todas');

  // FIGURINHAS PERSONALIZADAS
  const [paginaAtual, setPaginaAtual] = useState('menu'); // menu, album, camera, editor
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [selecaoPersonalizada, setSelecaoPersonalizada] = useState('Brasil');
  const [infoFigurinhaTemp, setInfoFigurinhaTemp] = useState(null);

  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const SELECOES = {
    Brasil: { cor: '#FDD835', bandeira: '🇧🇷', total: 23 },
    Argentina: { cor: '#1E40AF', bandeira: '🇦🇷', total: 23 },
    Uruguai: { cor: '#0066CC', bandeira: '🇺🇾', total: 23 },
    Paraguai: { cor: '#FF0000', bandeira: '🇵🇾', total: 23 },
    Chile: { cor: '#0039A6', bandeira: '🇨🇱', total: 23 },
    Colômbia: { cor: '#FFD700', bandeira: '🇨🇴', total: 23 },
    Espanha: { cor: '#DC2626', bandeira: '🇪🇸', total: 23 },
    Portugal: { cor: '#059669', bandeira: '🇵🇹', total: 23 },
    Itália: { cor: '#009246', bandeira: '🇮🇹', total: 23 },
    Holanda: { cor: '#EA580C', bandeira: '🇳🇱', total: 23 },
    França: { cor: '#1E3A8A', bandeira: '🇫🇷', total: 23 },
    Alemanha: { cor: '#000000', bandeira: '🇩🇪', total: 23 },
    Inglaterra: { cor: '#FFFFFF', bandeira: '🇬🇧', total: 23 },
    Bélgica: { cor: '#FF3D00', bandeira: '🇧🇪', total: 23 },
    Dinamarca: { cor: '#C8102E', bandeira: '🇩🇰', total: 23 },
    Suécia: { cor: '#006AA7', bandeira: '🇸🇪', total: 23 },
    Polônia: { cor: '#FFFFFF', bandeira: '🇵🇱', total: 23 },
    Croácia: { cor: '#FF0000', bandeira: '🇭🇷', total: 23 },
    Sérvia: { cor: '#0066CC', bandeira: '🇷🇸', total: 23 },
    Turquia: { cor: '#CE1126', bandeira: '🇹🇷', total: 23 },
    Escócia: { cor: '#0052CC', bandeira: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', total: 23 },
    Eslováquia: { cor: '#0066CC', bandeira: '🇸🇰', total: 23 },
    EUA: { cor: '#B22234', bandeira: '🇺🇸', total: 23 },
    México: { cor: '#006847', bandeira: '🇲🇽', total: 23 },
    Canadá: { cor: '#FF0000', bandeira: '🇨🇦', total: 23 },
    Japão: { cor: '#BC002D', bandeira: '🇯🇵', total: 23 },
  };

  // INICIALIZAR
  useEffect(() => {
    const saved = localStorage.getItem('album-panini');
    if (saved) {
      setFigurinhas(JSON.parse(saved));
    } else {
      const inicial = {};
      Object.keys(SELECOES).forEach(sel => {
        inicial[sel] = {};
        for (let i = 1; i <= SELECOES[sel].total; i++) {
          inicial[sel][i] = { status: 'nao_tem', duplicadas: 0 };
        }
      });
      setFigurinhas(inicial);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(figurinhas).length > 0) {
      localStorage.setItem('album-panini', JSON.stringify(figurinhas));
    }
  }, [figurinhas]);

  // ALBUM PANINI - Trocar status
  const trocarStatusFigurinhaAlbum = (num) => {
    setFigurinhas(prev => ({
      ...prev,
      [selecao]: {
        ...prev[selecao],
        [num]: {
          ...prev[selecao][num],
          status: prev[selecao][num].status === 'nao_tem' ? 'tem' : 'nao_tem',
          duplicadas: 0
        }
      }
    }));
  };

  const adicionarDuplicadaAlbum = (num) => {
    setFigurinhas(prev => ({
      ...prev,
      [selecao]: {
        ...prev[selecao],
        [num]: {
          ...prev[selecao][num],
          status: 'repetida',
          duplicadas: prev[selecao][num].duplicadas + 1
        }
      }
    }));
  };

  const removerDuplicadaAlbum = (num) => {
    setFigurinhas(prev => ({
      ...prev,
      [selecao]: {
        ...prev[selecao],
        [num]: {
          ...prev[selecao][num],
          duplicadas: Math.max(0, prev[selecao][num].duplicadas - 1),
          status: prev[selecao][num].duplicadas - 1 === 0 ? 'tem' : 'repetida'
        }
      }
    }));
  };

  // PROGRESSO
  const calcularProgresso = () => {
    if (!figurinhas[selecao]) return { presentes: 0, faltantes: 0, percentual: 0, duplicadas: 0 };
    let presentes = 0;
    let duplicadas = 0;
    Object.values(figurinhas[selecao]).forEach(fig => {
      if (fig.status !== 'nao_tem') presentes++;
      duplicadas += fig.duplicadas;
    });
    return {
      presentes,
      faltantes: SELECOES[selecao].total - presentes,
      percentual: Math.round((presentes / SELECOES[selecao].total) * 100),
      duplicadas
    };
  };

  // CÂMERA
  const abrirCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1440 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPaginaAtual('camera');
    } catch (err) {
      alert('Não foi possível acessar a câmera');
    }
  };

  const capturarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      const altura = video.videoHeight;
      const largura = (altura * 3) / 4;
      const x = (video.videoWidth - largura) / 2;
      
      canvasRef.current.width = largura;
      canvasRef.current.height = altura;
      context.drawImage(video, x, 0, largura, altura, 0, 0, largura, altura);
      const foto = canvasRef.current.toDataURL('image/jpeg');
      setFotoCapturada(foto);
      
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      
      setPaginaAtual('editor');
      setInfoFigurinhaTemp({
        nome: '',
        altura: '1.80m',
        numero: '7',
        posicao: 'Atacante',
        clube: '',
      });
    }
  };

  const obterFigurinhasParaMostrar = () => {
    if (!figurinhas[selecao]) return [];
    
    let figs = Object.entries(figurinhas[selecao]).map(([num, data]) => ({
      numero: parseInt(num),
      ...data
    }));

    if (filtroAlbum === 'tem') {
      figs = figs.filter(f => f.status === 'tem');
    } else if (filtroAlbum === 'nao_tem') {
      figs = figs.filter(f => f.status === 'nao_tem');
    } else if (filtroAlbum === 'repetidas') {
      figs = figs.filter(f => f.status === 'repetida');
    }
    
    return figs;
  };

  // EXPORTAR FALTANTES
  const exportarFaltantes = () => {
    let conteudo = `FIGURINHAS QUE FALTAM - ÁLBUM PANINI\n`;
    conteudo += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    conteudo += `Seleção: ${selecao}\n\n`;

    const faltantes = Object.entries(figurinhas[selecao])
      .filter(([_, data]) => data.status === 'nao_tem')
      .map(([num, _]) => parseInt(num))
      .sort((a, b) => a - b);

    if (faltantes.length === 0) {
      conteudo += 'Parabéns! Você tem todas as figurinhas desta seleção!';
    } else {
      conteudo += `Total: ${faltantes.length} figurinhas faltando\n\n`;
      conteudo += `Números: ${faltantes.join(', ')}\n\n`;
      
      // Dividir em grupos de 10 para visualização
      for (let i = 0; i < faltantes.length; i += 10) {
        conteudo += `${faltantes.slice(i, i + 10).join(', ')}\n`;
      }
    }

    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `faltantes-${selecao}-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    alert(`✅ Lista de faltantes exportada!\n${faltantes.length} figurinhas`);
  };

  // EXPORTAR REPETIDAS
  const exportarRepetidas = () => {
    let conteudo = `FIGURINHAS REPETIDAS - ÁLBUM PANINI\n`;
    conteudo += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    conteudo += `Seleção: ${selecao}\n\n`;

    const repetidas = Object.entries(figurinhas[selecao])
      .filter(([_, data]) => data.status === 'repetida')
      .map(([num, data]) => ({ numero: parseInt(num), duplicadas: data.duplicadas + 1 }))
      .sort((a, b) => a.numero - b.numero);

    if (repetidas.length === 0) {
      conteudo += 'Você não tem figurinhas repetidas!';
    } else {
      const totalRepetidas = repetidas.reduce((sum, fig) => sum + (fig.duplicadas - 1), 0);
      conteudo += `Total: ${repetidas.length} figurinhas diferentes\n`;
      conteudo += `Total de cópias extras: ${totalRepetidas}\n\n`;
      
      conteudo += `Número | Quantidade\n`;
      conteudo += `-------|----------\n`;
      repetidas.forEach(fig => {
        conteudo += `#${fig.numero}     | ×${fig.duplicadas}\n`;
      });

      conteudo += `\n\nPara trocar:\n`;
      repetidas.forEach(fig => {
        conteudo += `- Tenho ${fig.duplicadas} da #${fig.numero}\n`;
      });
    }

    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `repetidas-${selecao}-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    alert(`✅ Lista de repetidas exportada!\n${repetidas.length} figurinhas diferentes`);
  };

  const corSelecao = SELECOES[selecao].cor;
  const progresso = calcularProgresso();

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;500;700&family=Playfair+Display:wght@700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Fredoka', sans-serif; background: #f5f5f5; }
      `}</style>

      {/* MENU */}
      {paginaAtual === 'menu' && (
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.titulo}>🏆 ÁLBUM PANINI</h1>
            <p style={styles.subtitulo}>Gerencie seu álbum físico</p>
          </div>

          <div style={styles.main}>
            <div style={styles.menuGrid}>
              <button onClick={() => setPaginaAtual('album')} style={styles.menuCard}>
                <div style={styles.menuIcon}>📚</div>
                <h3>Meu Álbum</h3>
                <p>Marque as figurinhas<br/>que você tem</p>
              </button>

              <button onClick={() => abrirCamera()} style={styles.menuCard}>
                <div style={styles.menuIcon}>📸</div>
                <h3>Criar Figurinha</h3>
                <p>Crie figurinhas<br/>personalizadas</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ÁLBUM PANINI */}
      {paginaAtual === 'album' && (
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.titulo}>📚 Meu Álbum Panini</h1>
          </div>

          <div style={styles.main}>
            {/* Seletor */}
            <div style={styles.selectorGrid}>
              {Object.entries(SELECOES).map(([nome, dados]) => (
                <button
                  key={nome}
                  onClick={() => setSelecao(nome)}
                  style={{
                    ...styles.selecaoBtn,
                    backgroundColor: selecao === nome ? dados.cor : '#f0f0f0',
                    color: selecao === nome ? '#000' : '#666',
                  }}
                >
                  {dados.bandeira} {nome}
                </button>
              ))}
            </div>

            {/* Progresso */}
            <div style={{...styles.progressCard, borderTopColor: corSelecao}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h2 style={{color: corSelecao}}>{SELECOES[selecao].bandeira} {selecao}</h2>
                <span style={{fontSize: '28px', fontWeight: 700, color: corSelecao}}>{progresso.percentual}%</span>
              </div>

              <div style={{backgroundColor: '#e0e0e0', height: '12px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px'}}>
                <div style={{width: `${progresso.percentual}%`, height: '100%', backgroundColor: corSelecao}}></div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'}}>
                <div style={{textAlign: 'center', padding: '12px', backgroundColor: '#d1fae5', borderRadius: '8px'}}>
                  <div style={{fontSize: '12px', color: '#666'}}>Tenho</div>
                  <div style={{fontSize: '20px', fontWeight: 700, color: '#10b981'}}>{progresso.presentes}</div>
                </div>
                <div style={{textAlign: 'center', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px'}}>
                  <div style={{fontSize: '12px', color: '#666'}}>Faltam</div>
                  <div style={{fontSize: '20px', fontWeight: 700, color: '#ef4444'}}>{progresso.faltantes}</div>
                </div>
                <div style={{textAlign: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px'}}>
                  <div style={{fontSize: '12px', color: '#666'}}>Repetidas</div>
                  <div style={{fontSize: '20px', fontWeight: 700, color: '#f59e0b'}}>{progresso.duplicadas}</div>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div style={{display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap'}}>
              {[{id: 'todas', label: '📊 Todas'}, {id: 'tem', label: '✅ Tenho'}, {id: 'nao_tem', label: '❌ Faltam'}, {id: 'repetidas', label: '📦 Repetidas'}].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFiltroAlbum(f.id)}
                  style={{padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: filtroAlbum === f.id ? '#1f2937' : '#e5e7eb', color: filtroAlbum === f.id ? '#fff' : '#666', fontWeight: filtroAlbum === f.id ? 700 : 500}}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Botões de Exportação */}
            <div style={{display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap'}}>
              <button 
                onClick={exportarFaltantes}
                style={{padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '14px'}}
              >
                📥 Exportar Faltantes
              </button>
              <button 
                onClick={exportarRepetidas}
                style={{padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#f59e0b', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '14px'}}
              >
                📥 Exportar Repetidas
              </button>
            </div>

            {/* Grid de Figurinhas */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '24px'}}>
              {obterFigurinhasParaMostrar().map(fig => {
                let bgColor, borderColor, boxShadow;
                
                if (fig.status === 'tem') {
                  bgColor = '#d1fae5';
                  borderColor = '#10b981';
                  boxShadow = '0 0 0 3px #10b981';
                } else if (fig.status === 'nao_tem') {
                  bgColor = '#fee2e2';
                  borderColor = '#ef4444';
                  boxShadow = '0 0 0 3px #ef4444';
                } else if (fig.status === 'repetida') {
                  bgColor = '#fef3c7';
                  borderColor = '#f59e0b';
                  boxShadow = '0 0 0 3px #f59e0b, inset 0 0 8px rgba(0,0,0,0.1)';
                }

                return (
                  <div
                    key={fig.numero}
                    style={{backgroundColor: bgColor, border: `3px solid ${borderColor}`, borderRadius: '12px', padding: '8px', position: 'relative', textAlign: 'center', boxShadow: boxShadow, display: 'flex', flexDirection: 'column'}}
                  >
                    {/* Número */}
                    <div style={{fontSize: '24px', fontWeight: 'bold', color: borderColor, marginBottom: '4px', cursor: 'pointer'}} onClick={() => trocarStatusFigurinhaAlbum(fig.numero)}>#{fig.numero}</div>
                    
                    {/* Status texto */}
                    {fig.status === 'tem' && <div style={{fontSize: '11px', fontWeight: 'bold', color: '#10b981', marginBottom: '6px'}}>✓ Tenho</div>}
                    {fig.status === 'nao_tem' && <div style={{fontSize: '11px', fontWeight: 'bold', color: '#ef4444', marginBottom: '6px'}}>✗ Falta</div>}
                    {fig.status === 'repetida' && <div style={{fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px'}}>⭐ Repetida</div>}

                    {/* Botões para TEM (mostrar + para adicionar repetida) */}
                    {fig.status === 'tem' && (
                      <button 
                        onClick={(e) => {e.stopPropagation(); adicionarDuplicadaAlbum(fig.numero);}}
                        style={{width: '100%', padding: '4px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'}}
                      >
                        + Repetida
                      </button>
                    )}

                    {/* Botões para REPETIDA (mostrar +/-) */}
                    {fig.status === 'repetida' && (
                      <div style={{display: 'flex', gap: '2px', justifyContent: 'center'}}>
                        <button 
                          onClick={(e) => {e.stopPropagation(); removerDuplicadaAlbum(fig.numero);}} 
                          style={{flex: 1, padding: '4px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'}}
                        >
                          −
                        </button>
                        <span style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px'}}>×{fig.duplicadas + 1}</span>
                        <button 
                          onClick={(e) => {e.stopPropagation(); adicionarDuplicadaAlbum(fig.numero);}} 
                          style={{flex: 1, padding: '4px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'}}
                        >
                          +
                        </button>
                      </div>
                    )}

                    {/* Badge no canto (para repetidas) */}
                    {fig.status === 'repetida' && (
                      <div style={{position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '2px solid white'}}>
                        ×{fig.duplicadas + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={() => setPaginaAtual('menu')} style={{...styles.btnPrimario, backgroundColor: '#6B7280', width: '100%'}}>← Voltar</button>
          </div>
        </div>
      )}

      {/* CÂMERA */}
      {paginaAtual === 'camera' && (
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.titulo}>📸 Tirar Foto</h1>
          </div>

          <div style={styles.main}>
            <video ref={videoRef} autoPlay playsInline style={{width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px'}} />
            
            <div style={{display: 'flex', gap: '12px'}}>
              <button onClick={capturarFoto} style={{...styles.btnPrimario, backgroundColor: '#10b981', flex: 1}}>📷 Capturar</button>
              <button onClick={() => {if (videoRef.current && videoRef.current.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop()); setPaginaAtual('menu');}} style={{...styles.btnPrimario, backgroundColor: '#ef4444', flex: 1}}>❌ Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* EDITOR */}
      {paginaAtual === 'editor' && fotoCapturada && infoFigurinhaTemp && (
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.titulo}>✏️ Editar Figurinha</h1>
          </div>

          <div style={styles.main}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <img src={fotoCapturada} style={{width: '100%', borderRadius: '12px'}} alt="Foto" />

              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div>
                  <label style={{fontSize: '12px', fontWeight: 700}}>🏆 Seleção:</label>
                  <select value={selecaoPersonalizada} onChange={(e) => setSelecaoPersonalizada(e.target.value)} style={styles.input}>
                    {Object.keys(SELECOES).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{fontSize: '12px', fontWeight: 700}}>👤 Nome:</label>
                  <input type="text" value={infoFigurinhaTemp.nome} onChange={(e) => setInfoFigurinhaTemp({...infoFigurinhaTemp, nome: e.target.value})} style={styles.input} />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 700}}>📊 Altura:</label>
                    <input type="text" value={infoFigurinhaTemp.altura} onChange={(e) => setInfoFigurinhaTemp({...infoFigurinhaTemp, altura: e.target.value})} style={styles.input} />
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 700}}>📍 Nº:</label>
                    <input type="number" value={infoFigurinhaTemp.numero} onChange={(e) => setInfoFigurinhaTemp({...infoFigurinhaTemp, numero: e.target.value})} style={styles.input} />
                  </div>
                </div>

                <div>
                  <label style={{fontSize: '12px', fontWeight: 700}}>⚽ Posição:</label>
                  <select value={infoFigurinhaTemp.posicao} onChange={(e) => setInfoFigurinhaTemp({...infoFigurinhaTemp, posicao: e.target.value})} style={styles.input}>
                    <option>Goleiro</option>
                    <option>Zagueiro</option>
                    <option>Lateral</option>
                    <option>Volante</option>
                    <option>Meia</option>
                    <option>Atacante</option>
                  </select>
                </div>

                <div>
                  <label style={{fontSize: '12px', fontWeight: 700}}>🏢 Clube:</label>
                  <input type="text" value={infoFigurinhaTemp.clube} onChange={(e) => setInfoFigurinhaTemp({...infoFigurinhaTemp, clube: e.target.value})} style={styles.input} />
                </div>

                <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
                  <button onClick={() => {alert('Figurinha criada! 📸'); setFotoCapturada(null); setPaginaAtual('menu');}} style={{...styles.btnPrimario, backgroundColor: '#10b981', flex: 1}}>✅ Salvar</button>
                  <button onClick={() => {setFotoCapturada(null); setPaginaAtual('menu');}} style={{...styles.btnPrimario, backgroundColor: '#ef4444', flex: 1}}>❌ Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{display: 'none'}} />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    background: 'linear-gradient(135deg, #1e40af 0%, #dc2626 100%)',
    color: '#fff',
    padding: '32px 20px',
    textAlign: 'center',
  },
  titulo: {
    fontSize: '36px',
    fontWeight: 700,
    marginBottom: '8px',
  },
  subtitulo: {
    fontSize: '14px',
    opacity: 0.9,
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 20px',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  menuCard: {
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '16px',
    padding: '32px 20px',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  menuIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  selectorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  selecaoBtn: {
    padding: '12px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 700,
    transition: 'all 0.3s ease',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    borderTop: '4px solid',
  },
  btnPrimario: {
    padding: '14px 28px',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '16px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    marginTop: '4px',
  },
};

export default AlbumPanini;
