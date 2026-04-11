#!/usr/bin/env bun
import { runPrompts } from './prompts';
import { generateProject, generateAiProject } from './generator'; // นำเข้า generateAiProject
import { generateProjectStructure } from './ai';
import { outro } from '@clack/prompts';

async function main() {
  const options = await runPrompts();

  if (options.framework === 'ai-generate' && options.aiPrompt) {
    // --- โหมด AI (Generative Mode) ---
    const aiData = await generateProjectStructure(options.aiPrompt);

    // เรียกใช้ฟังก์ชันสร้างไฟล์ลงโฟลเดอร์จริง
    generateAiProject(options, aiData);

    // แสดงคำแนะนำขั้นตอนถัดไป (นำคำสั่ง Install ของ AI มาแสดง)
    outro(`\nSuccess! AI generated project "${options.name}" is ready.\n\nNext steps:\n  cd ${options.name}\n  ${aiData.install_command}`);

  } else {
    // --- โหมดปกติ (Deterministic Mode) ---
    generateProject(options);
    outro(`\nSuccess! Project ${options.name} is ready. \nNavigate to it using: cd ${options.name}`);
  }
}

main().catch(console.error);