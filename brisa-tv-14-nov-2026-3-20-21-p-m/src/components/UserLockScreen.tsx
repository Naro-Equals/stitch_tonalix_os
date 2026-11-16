import React, { useEffect, useState } from 'react';
import { Lock, Power, Shield, Unlock, User } from 'lucide-react';
import { UserProfile } from '../types/launcher';

interface UserLockScreenProps {
  users: UserProfile[];
  tvPoweredOff: boolean;
  onPowerOn: () => void;
  onUnlockUser: (userId: string) => void;
}

export const UserLockScreen: React.FC<UserLockScreenProps> = ({
  users,
  tvPoweredOff,
  onPowerOn,
  onUnlockUser,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id ?? '');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? users[0];

  useEffect(() => {
    setPinInput('');
    setErrorMsg(null);
  }, [selectedUserId, tvPoweredOff]);

  useEffect(() => {
    if (tvPoweredOff || !selectedUser) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        setErrorMsg(null);
        setPinInput((prev) => {
          const next = prev.length < 4 ? prev + e.key : prev;
          if (next.length === 4) {
            if (!selectedUser.pin || next === selectedUser.pin) {
              setTimeout(() => onUnlockUser(selectedUser.id), 90);
            } else {
              setTimeout(() => {
                setErrorMsg('PIN incorrecto para este perfil.');
                setPinInput('');
              }, 140);
            }
          }
          return next;
        });
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setPinInput((prev) => prev.slice(0, -1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const idx = users.findIndex((u) => u.id === selectedUser.id);
        const next = users[(idx + 1) % users.length];
        if (next) setSelectedUserId(next.id);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const idx = users.findIndex((u) => u.id === selectedUser.id);
        const prev = users[(idx - 1 + users.length) % users.length];
        if (prev) setSelectedUserId(prev.id);
      } else if (e.key === 'Enter' && !selectedUser.pin) {
        e.preventDefault();
        onUnlockUser(selectedUser.id);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tvPoweredOff, selectedUser, users, onUnlockUser]);

  const handleDigitClick = (digit: string) => {
    if (!selectedUser) return;
    setErrorMsg(null);
    if (pinInput.length >= 4) return;
    const next = pinInput + digit;
    setPinInput(next);
    if (next.length === 4) {
      if (!selectedUser.pin || next === selectedUser.pin) {
        setTimeout(() => onUnlockUser(selectedUser.id), 90);
      } else {
        setTimeout(() => {
          setErrorMsg('PIN incorrecto para este perfil.');
          setPinInput('');
        }, 160);
      }
    }
  };

  if (tvPoweredOff) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020304] text-white p-8">
        <button
          type="button"
          onClick={onPowerOn}
          className="group flex flex-col items-center gap-5 cursor-pointer focus:outline-none"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/80 group-hover:border-white/50 group-hover:bg-white/10 group-hover:text-white transition-all">
            <Power className="h-8 w-8" />
          </div>
          <div className="text-center">
            <div className="font-display text-lg font-medium text-white/90">
              TV apagada · Sesiones cerradas
            </div>
            <p className="mt-1 text-xs text-white/45">
              Pulsa para encender el televisor y elegir usuario
            </p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#11222A_0%,_#090C12_55%,_#050609_100%)] p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-cyan-300/90 mb-1">
              <Shield className="h-4 w-4" />
              <span>Sesiones blindadas independientes</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">
              ¿Quién está viendo Tonalix TV?
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Cada usuario mantiene sus propias apps, colores, ocultos y ajustes aislados.
            </p>
          </div>
        </div>

        {/* Two-column layout: Profile selector left, PIN keypad right */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-stretch">
          {/* User Profiles */}
          <div className="md:col-span-6 space-y-3 flex flex-col justify-center">
            {users.map((user) => {
              const active = user.id === selectedUser?.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  style={
                    active
                      ? { boxShadow: `0 0 0 2px ${user.avatarColor}` }
                      : undefined
                  }
                  className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    active
                      ? 'border-transparent bg-white/12 text-white'
                      : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[#07090D]"
                      style={{ backgroundColor: user.avatarColor }}
                    >
                      <User className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-base font-semibold text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-white/55 truncate">{user.roleLabel}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60 shrink-0">
                    {user.pin ? (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>PIN</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 text-emerald-400" />
                        <span>Libre</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}

            <p className="pt-2 text-xs text-white/45">
              PIN predeterminados de prueba: Perfil 1 (<span className="font-mono-tabular text-white/75">1234</span>) · Perfil 2 (<span className="font-mono-tabular text-white/75">5678</span>). Cámbialos dentro de Ajustes.
            </p>
          </div>

          {/* PIN Pad */}
          {selectedUser && (
            <div className="md:col-span-6 rounded-2xl border border-white/12 bg-[#0F141D]/90 p-6 flex flex-col justify-between">
              <div className="text-center">
                <div className="text-xs text-white/55">Desbloquear sesión</div>
                <div className="font-display text-lg font-semibold text-white mt-0.5">
                  {selectedUser.name}
                </div>

                {selectedUser.pin ? (
                  <>
                    <div className="mt-4 flex justify-center gap-3">
                      {[0, 1, 2, 3].map((slot) => (
                        <div
                          key={slot}
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border font-mono-tabular text-lg font-semibold transition-colors ${
                            pinInput.length > slot
                              ? 'border-white bg-white/15 text-white'
                              : 'border-white/15 bg-white/[0.03] text-white/25'
                          }`}
                        >
                          {pinInput.length > slot ? '•' : ''}
                        </div>
                      ))}
                    </div>
                    {errorMsg && (
                      <p className="mt-2.5 text-xs text-rose-400">{errorMsg}</p>
                    )}
                  </>
                ) : (
                  <p className="mt-3 text-xs text-emerald-400">
                    Este perfil no requiere PIN
                  </p>
                )}
              </div>

              {selectedUser.pin ? (
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleDigitClick(digit)}
                      className="rounded-xl bg-white/[0.06] py-3 font-mono-tabular text-base font-semibold text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPinInput('')}
                    className="rounded-xl bg-white/[0.03] py-3 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    Borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDigitClick('0')}
                    className="rounded-xl bg-white/[0.06] py-3 font-mono-tabular text-base font-semibold text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setPinInput((p) => p.slice(0, -1))}
                    className="rounded-xl bg-white/[0.03] py-3 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    ←
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onUnlockUser(selectedUser.id)}
                  className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-[#0B0D12] hover:bg-white/90 transition-colors cursor-pointer"
                >
                  Entrar a {selectedUser.name}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
