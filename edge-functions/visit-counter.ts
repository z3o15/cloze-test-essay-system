/**
 * 访问计数边缘函数
 * 使用EdgeOne KV存储实现访问计数功能
 */

export async function onRequestGet({ request, params, env }) {
  try {
    // 读取KV数据 - 使用正确的命名空间引用
    // EdgeOne中KV存储通过环境变量访问
    const visitCount = await env.coey.get('visitCount');
    
    // 处理初始值为undefined的情况
    let visitCountInt = Number(visitCount) || 0;
    visitCountInt += 1;

    // 写入KV数据
    await env.coey.put('visitCount', String(visitCountInt));
  
    // 构造响应
    const response = JSON.stringify({
      visitCount: visitCountInt,
      success: true
    });
  
    return new Response(response, {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    // 错误处理
    console.error('访问计数出错:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || '未知错误'
    }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

/**
 * EdgeOne Pages入口函数
 * 处理所有请求方法
 */
export default async function handler(request: Request, env: any) {
  // 根据HTTP方法路由到不同处理函数
  const method = request.method;
  
  switch (method) {
    case 'GET':
      return onRequestGet({ request, env });
    default:
      // 处理不支持的方法
      return new Response(JSON.stringify({
        success: false,
        error: `不支持的方法: ${method}`
      }), {
        status: 405,
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Allow': 'GET'
        }
      });
  }
}