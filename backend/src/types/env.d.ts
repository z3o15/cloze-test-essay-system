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
    
    // JWT配置
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    
    // 火山AI配置
    VOLCANO_API_KEY?: string;
    VOLCANO_API_URL?: string;
    VOLCANO_MODEL?: string;
    VOLCANO_DAILY_TOKEN_LIMIT?: string;
    VOLCANO_MAX_CONCURRENT?: string;
  }
}