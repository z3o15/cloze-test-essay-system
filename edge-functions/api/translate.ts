import { TencentAPIV3 } from 'tencentcloud-sdk-nodejs-tmt';
import type { NextApiRequest, NextApiResponse } from 'next';

// 从环境变量中获取密钥
const TENCENT_SECRET_ID = process.env.TENCENT_SECRET_ID;
const TENCENT_SECRET_KEY = process.env.TENCENT_SECRET_KEY;
const TENCENT_REGION = process.env.TENCENT_REGION || 'ap-guangzhou';
const TENCENT_PROJECT_ID = process.env.TENCENT_PROJECT_ID ? parseInt(process.env.TENCENT_PROJECT_ID, 10) : 0;


// 初始化腾讯云客户端
let tencentClient: TencentAPIV3 | null = null;
if (TENCENT_SECRET_ID && TENCENT_SECRET_KEY) {
  tencentClient = new TencentAPIV3({
    credential: {
      secretId: TENCENT_SECRET_ID,
      secretKey: TENCENT_SECRET_KEY,
    },
    region: TENCENT_REGION,
    profile: {
      httpProfile: {
        endpoint: "tmt.tencentcloudapi.com",
      },
    },
  });
} else {
  console.error("Tencent API credentials (TENCENT_SECRET_ID or TENCENT_SECRET_KEY) are not configured in environment variables.");
}

async function callTencentAPI(text: string, source: string, target: string) {
  if (!tencentClient) {
    console.error("Tencent client is not initialized. Check environment variables.");
    throw new Error("Tencent client not initialized.");
  }

  console.log("Calling Tencent API with text:", text);

  try {
    const response = await tencentClient.TextTranslate({
      SourceText: text,
      Source: source,
      Target: target,
      ProjectId: TENCENT_PROJECT_ID,
    });
    console.log("Tencent API Response:", response);
    if (response.TargetText) {
      return response.TargetText;
    } else {
      // 在腾讯云的响应中，即使是错误，也可能不会抛出异常，而是返回包含Error字段的响应
      if (response.Error) {
        console.error("Tencent API returned an error:", response.Error);
        throw new Error(`Tencent API Error: ${response.Error.Message} (Code: ${response.Error.Code})`);
      }
      console.error("Tencent API returned an unexpected response structure:", response);
      throw new Error("Tencent API returned no translated text and no error information.");
    }
  } catch (error) {
    console.error("Failed to call Tencent Translate API:", error);
    // 抛出更具体的错误信息
    throw new Error(`Failed to execute Tencent API call: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { text, source = 'auto', target = 'zh' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required for translation.' });
  }
  
  if (!tencentClient) {
      console.error("Handler: Tencent client is not initialized. Cannot process translation request.");
      return res.status(500).json({ error: 'Translation service is not configured correctly on the server.' });
  }

  console.log(`Received translation request: from=${source}, to=${target}, text="${text}"`);

  try {
    const translatedText = await callTencentAPI(text, source, target);
    return res.status(200).json({ translatedText });
  } catch (error) {
    console.error("Error during translation process in handler:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: `Translation failed: ${errorMessage}` });
  }
}
