declare namespace NodeJS {
  interface ProcessEnv {
    // 服务器配置
    NODE_ENV?: 'development' | 'production' | 'test';
    PORT?: string;
    LOG_LEVEL?: string;
    
    // 数据库配置
    DB_HOST?: string;
    DB_PORT?: string;
    DB_NAME?: string;
    DB_USER?: string;
    DB_PASSWORD?: string;
    DB_SSL?: string;
    
    // Redis配置
    REDIS_HOST?: string;
    REDIS_PORT?: string;
    REDIS_PASSWORD?: string;
    REDIS_DB?: string;
    
    // 缓存配置
    CACHE_TTL_TRANSLATION?: string;
    
    // JWT配置
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    
    // 腾讯翻译API
    TENCENT_APP_ID?: string;
    TENCENT_APP_KEY?: string;
    TENCENT_TRANSLATE_URL?: string;
    
    // 火山翻译API
    VOLCANO_API_KEY?: string;
    VOLCANO_API_URL?: string;
    
    // 百度翻译API
    BAIDU_APP_ID?: string;
    BAIDU_APP_KEY?: string;
    BAIDU_TRANSLATE_URL?: string;
  }
}