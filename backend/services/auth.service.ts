import axios from 'axios';
import { env } from '../config/env';
import { signToken } from '../utils/auth';

interface WechatSessionResponse {
  openid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
}

const buildWechatSessionUrl = (code: string) => {
  const base = 'https://api.weixin.qq.com/sns/jscode2session';
  const params = new URLSearchParams({
    appid: env.wxAppId,
    secret: env.wxSecret,
    js_code: code,
    grant_type: 'authorization_code'
  });
  return `${base}?${params.toString()}`;
};

export const loginWithCode = async (code: string) => {
  if (!code) {
    throw new Error('code is required');
  }

  let openid = '';

  if (!env.wxAppId || !env.wxSecret || code === 'mock') {
    openid = `mock_${Date.now()}`;
  } else {
    const url = buildWechatSessionUrl(code);
    const { data } = await axios.get<WechatSessionResponse>(url);

    if (data.errcode) {
      throw new Error(`wechat login failed: ${data.errmsg || data.errcode}`);
    }

    if (!data.openid) {
      throw new Error('wechat login failed: missing openid');
    }

    openid = data.openid;
  }

  const token = signToken(openid);

  return {
    openid,
    token,
    expiresIn: 60 * 60 * 24 * 7
  };
};
