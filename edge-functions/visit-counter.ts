import { KVNamespace } from '@cloudflare/workers-types';

declare global {
  const KV: KVNamespace;
}

interface Env {
  KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 设置CORS头
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    });

    // 处理OPTIONS请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers, status: 204 });
    }

    try {
      // 获取当前计数
      let count = 0;
      const existingCount = await env.KV.get('visit_count');
      
      if (existingCount) {
        count = parseInt(existingCount, 10);
      }
      
      // 递增计数
      count += 1;
      
      // 异步更新KV存储（不阻塞响应）
      ctx.waitUntil(env.KV.put('visit_count', count.toString()));
      
      // 返回JSON响应
      return new Response(JSON.stringify({
        success: true,
        count,
        message: '访问计数更新成功'
      }), {
        headers,
        status: 200
      });
    } catch (error) {
      console.error('访问计数更新失败:', error);
      
      // 返回错误响应
      return new Response(JSON.stringify({
        success: false,
        message: '访问计数更新失败',
        error: error instanceof Error ? error.message : '未知错误'
      }), {
        headers,
        status: 500
      });
    }
  }
};