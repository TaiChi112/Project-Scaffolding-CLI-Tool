import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. กำหนดโครงสร้างข้อมูลให้ TypeScript ตรวจสอบความถูกต้อง
export interface AIProjectStructure {
    project_name: string;
    dependencies: string[];
    install_command: string;
    files: {
        path: string;
        content: string;
    }[];
}

export async function generateProjectStructure(prompt: string): Promise<AIProjectStructure> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('\nError: GEMINI_API_KEY environment variable is missing.');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 2. การตั้งค่า Model และ System Prompt อย่างเข้มงวด
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        // System Instruction คือคำสั่งระดับรากฐานที่ AI ต้องปฏิบัติตามอย่างเคร่งครัด
        systemInstruction: `You are an expert Software Architect CLI. 
    Your ONLY job is to take a user's project description and output a valid JSON object representing the exact project structure and code files needed.
    DO NOT output any conversational text, explanations, or markdown blocks.
    
    The JSON output MUST strictly adhere to this schema:
    {
      "project_name": "string (kebab-case)",
      "dependencies": ["string"],
      "install_command": "string (e.g., npm install, pip install -r requirements.txt)",
      "files": [
        { 
          "path": "string (e.g., src/main.py, requirements.txt, package.json)", 
          "content": "string (the actual complete code or file content)" 
        }
      ]
    }
    
    Ensure that the code provided in the "content" is complete, functional, and follows best practices for the requested technology.`,

        // บังคับให้ AI ตอบกลับมาเป็น JSON Format เท่านั้น (ป้องกันการหลุด Markdown)
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2 // ค่าความสุ่ม 낮 (0.2) เพื่อให้ได้ผลลัพธ์ที่เป็นโครงสร้างชัดเจน ไม่เพ้อเจ้อ
        }
    });

    console.log('\nAI is designing your project architecture... (This may take 10-30 seconds)');

    try {
        // 3. ส่งคำสั่งจากผู้ใช้ (User Prompt)
        const result = await model.generateContent(`Create a project setup for: ${prompt}`);

        const text = result.response.text();

        // 4. แปลงข้อความ JSON String ให้กลายเป็น JavaScript Object
        const parsedData = JSON.parse(text) as AIProjectStructure;

        return parsedData;

    } catch (error) {
        console.error('\nAI Generation Failed. The model might have produced invalid JSON or the connection timed out.');
        console.error(error);
        process.exit(1);
    }
}