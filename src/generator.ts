import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import type { ProjectOptions } from './prompts';
// นำเข้า Type ของ AI Project ที่เราสร้างไว้ใน ai.ts
import type { AIProjectStructure } from './ai';

export function generateProject(options: ProjectOptions) {
    const targetDir = path.join(process.cwd(), options.name);

    // อ้างอิง Path แบบ Dynamic ตาม Framework ที่ผู้ใช้เลือก
    const templateDir = path.join(import.meta.dir, `../templates/frameworks/${options.framework}`);

    if (fs.existsSync(targetDir)) {
        console.error(`\nError: Directory "${options.name}" already exists.`);
        process.exit(1);
    }

    console.log(`\nScaffolding ${options.framework} project in ${targetDir}...`);

    try {
        // 1. Core Copy
        fs.copySync(templateDir, targetDir);

        // 2. Add-ons (อ้างอิง Path ใหม่)
        if (options.docker) {
            const dockerDir = path.join(import.meta.dir, '../templates/addons/docker');
            if (fs.existsSync(dockerDir)) fs.copySync(dockerDir, targetDir);
        }

        if (options.github) {
            const githubDir = path.join(import.meta.dir, '../templates/addons/github-actions');
            if (fs.existsSync(githubDir)) fs.copySync(githubDir, targetDir);
        }

        if (options.env) {
            const envDir = path.join(import.meta.dir, '../templates/addons/env');
            if (fs.existsSync(envDir)) fs.copySync(envDir, targetDir);
        }

        if (options.docs) {
            const docsDir = path.join(import.meta.dir, '../templates/addons/docs');
            if (fs.existsSync(docsDir)) fs.copySync(docsDir, targetDir);
        }

        // 3. File Mutation
        const packageJsonPath = path.join(targetDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const pkg = fs.readJsonSync(packageJsonPath);
            pkg.name = options.name;
            fs.writeJsonSync(packageJsonPath, pkg, { spaces: 2 });
        }

        // 4. Gitignore
        const gitignoreContent = `node_modules/\n.env\n.env.*\n!.env.example\ndist/\n.DS_Store`;
        fs.writeFileSync(path.join(targetDir, '.gitignore'), gitignoreContent.trim());

        // 5. Execution (General)
        console.log('\nInitializing Git repository...');
        execSync('git init', { cwd: targetDir, stdio: 'inherit' });

        console.log('\nInstalling dependencies via Bun...');
        execSync('bun install', { cwd: targetDir, stdio: 'inherit' });

        // 6. Smart Execution (Framework Specific)
        let nextSteps = `\nSuccess! Project ${options.name} is ready.\n\nNext steps:\n  cd ${options.name}\n  bun run dev`;

        if (options.framework === 'elysia-crud') {
            console.log('\nSetting up Prisma Environment...');

            // 6.1 สร้างไฟล์ .env จาก .env.example
            const envExamplePath = path.join(targetDir, '.env.example');
            const envPath = path.join(targetDir, '.env');
            if (fs.existsSync(envExamplePath)) {
                fs.copySync(envExamplePath, envPath);
                console.log('Created .env file.');
            }

            // 6.2 รัน Prisma Generate เพื่อสร้าง Type-safe Client
            try {
                console.log('Generating Prisma Client...');
                execSync('bunx prisma generate', { cwd: targetDir, stdio: 'inherit' });
            } catch (error) {
                console.warn('Warning: Prisma generate could not complete. You may need to run it manually later.');
            }

            // 6.3 ปรับเปลี่ยนคำแนะนำ (Next Steps) ให้เหมาะสมกับ Elysia
            nextSteps = `\nSuccess! Elysia CRUD Project "${options.name}" is ready.\n
Next steps:
  1. cd ${options.name}
  2. Update your DATABASE_URL in the .env file.
  3. Run: bun run db:push (to sync your database schema)
  4. Run: bun run dev (to start the server)`;
        }

        // 7. พิมพ์คำแนะนำขั้นตอนต่อไปให้ผู้ใช้ทราบ
        console.log(nextSteps);

    } catch (error) {
        console.error('Failed to scaffold project:', error);
        process.exit(1);
    }
}


export function generateAiProject(options: ProjectOptions, aiData: AIProjectStructure) {
    // ใช้ชื่อโปรเจกต์ที่ผู้ใช้กรอกในตอนแรกเป็นชื่อโฟลเดอร์หลัก
    const targetDir = path.join(process.cwd(), options.name);

    if (fs.existsSync(targetDir)) {
        console.error(`\nError: Directory "${options.name}" already exists.`);
        process.exit(1);
    }

    console.log(`\nMaterializing AI-generated project in ${targetDir}...`);

    try {
        // 1. วนลูปอ่านข้อมูลไฟล์ที่ AI สร้างมาให้
        for (const file of aiData.files) {
            // นำ Path ของ AI มาต่อตูดกับ Path ของโฟลเดอร์เป้าหมาย
            const fullPath = path.join(targetDir, file.path);

            // ใช้ outputFileSync เพื่อสร้างไฟล์และโฟลเดอร์ย่อยอัตโนมัติ
            fs.outputFileSync(fullPath, file.content);

            console.log(`  Created: ${file.path}`);
        }

        // 2. การจัดการส่วนเสริม (Add-ons) ตามที่ผู้ใช้เลือกในตอนแรก
        if (options.docker) {
            console.log('  Adding Docker configuration...');
            const dockerDir = path.join(import.meta.dir, '../templates/addons/docker');
            if (fs.existsSync(dockerDir)) fs.copySync(dockerDir, targetDir);
        }

        if (options.github) {
            console.log('  Adding GitHub Actions workflow...');
            const githubDir = path.join(import.meta.dir, '../templates/addons/github-actions');
            if (fs.existsSync(githubDir)) fs.copySync(githubDir, targetDir);
        }

        // 3. สร้าง .gitignore พื้นฐานป้องกันการหลุดของไฟล์ขยะ
        const gitignoreContent = `node_modules/\n.env\n.env.*\n!.env.example\ndist/\nbuild/\n.DS_Store\n__pycache__/\n*.pyc\nvenv/\n.venv/`;
        fs.writeFileSync(path.join(targetDir, '.gitignore'), gitignoreContent.trim());

        // 4. เริ่มต้นระบบ Git
        execSync('git init', { cwd: targetDir, stdio: 'inherit' });

        // 5. การติดตั้ง Environment อัตโนมัติ (Dynamic Execution)
        if (aiData.install_command) {
            console.log(`\nExecuting setup command: ${aiData.install_command}`);
            try {
                // สั่งรันคำสั่งที่ได้จาก AI ในโฟลเดอร์เป้าหมาย
                execSync(aiData.install_command, { cwd: targetDir, stdio: 'inherit' });
                console.log('\nEnvironment setup completed successfully.');
            } catch (error) {
                // Graceful Degradation: หากรันไม่ผ่าน ให้แจ้งเตือนแต่ไม่หยุดการทำงานของโปรแกรม
                console.warn(`\nWarning: Automated setup failed or tool is missing.`);
                console.warn(`You will need to run '${aiData.install_command}' manually.`);
            }
        } else {
            console.warn('\nWarning: No install command provided by AI. Please check the project structure and install dependencies manually.');
        }

    } catch (error) {
        console.error('Failed to materialize AI project:', error);
        process.exit(1);
    }
}