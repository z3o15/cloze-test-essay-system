// 声明KV存储（EdgeOne兼容）
declare const kv: {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: string, options?: { ex?: number }): Promise<void>;
};

export default async function handler(request: Request): Promise<Response> {
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
      const existingCount = await kv.get<string>('visit_count');
      
      if (existingCount) {
        count = parseInt(existingCount, 10);
      }
      
      // 递增计数
      count += 1;
      
      // 更新KV存储
      await kv.set('visit_count', count.toString());
      
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