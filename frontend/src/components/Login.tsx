import React, { useState } from 'react';
import { Button, Input, Segmented } from 'antd';
import { useGameStore } from '../store/gameStore';

export const Login: React.FC = () => {
  const { setGameState } = useGameStore();
  const [mode, setMode] = useState<'account' | 'wechat'>('account');

  const enterApp = () => {
    setGameState('menu');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-100 blur-lg opacity-60"></div>
        <div className="relative rounded-[24px] border-2 border-amber-200 bg-amber-50 shadow-2xl overflow-hidden">
          <div className="px-8 pt-10 pb-8">
            <div className="text-center">
              <div className="text-xs uppercase tracking-[0.35em] text-amber-600">English Beater</div>
              <h1 className="mt-3 text-4xl font-bold text-slate-800">Joyful English</h1>
              <p className="mt-2 text-sm text-slate-500">A rhythm-driven vocabulary journey</p>
            </div>

            <div className="mt-8 rounded-xl border border-amber-100 bg-white/70 p-4 shadow-sm">
              <div className="text-xs text-slate-500 mb-3">Login Method</div>
              <Segmented
                value={mode}
                onChange={(value) => setMode(value as 'account' | 'wechat')}
                options={[
                  { label: '账号密码登录', value: 'account' },
                  { label: '微信验证登录', value: 'wechat' }
                ]}
                size="large"
              />

              {mode === 'account' ? (
                <div className="mt-4 space-y-3">
                  <Input placeholder="账号 / Email" size="large" />
                  <Input.Password placeholder="密码" size="large" />
                  <Button type="primary" size="large" className="w-full" onClick={enterApp}>
                    登录进入
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
                    微信验证登录（暂不校验，点击即可进入）
                  </div>
                  <Button size="large" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={enterApp}>
                    微信一键进入
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-xs text-slate-400">
              Inspired by classic English book covers · Enjoy the rhythm
            </div>
          </div>

          <div className="h-3 bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200"></div>
        </div>
      </div>
    </div>
  );
};
