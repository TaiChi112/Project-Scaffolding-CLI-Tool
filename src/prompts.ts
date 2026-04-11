import { intro, group, text, confirm, cancel, select } from '@clack/prompts';

// กำหนดโครงสร้างข้อมูลให้ TypeScript รู้จัก
export interface ProjectOptions {
    name: string;
    framework: string;
    aiPrompt?: string;
    docker: boolean;
    github: boolean;
    env: boolean;
    docs: boolean;
}

export async function runPrompts(): Promise<ProjectOptions> {
    intro('System Initialized: Scalable CLI Builder');

    const options = await group(
        {
            name: () => text({
                message: 'What is your project name?',
                validate: (v: string | undefined) => v?.trim() ? void 0 : 'Project name is required!'
            }),
            // เตรียมตัวแปร framework ไว้ชั่วคราว (จะเปลี่ยนเป็นแบบให้เลือกใน Queue 2)
            framework: () => select({
                message: 'Which framework would you like to use?',
                options: [
                    { value: 'base', label: 'Basic TypeScript (General Purpose)' },
                    { value: 'elysia-crud', label: 'Elysia CRUD' },
                    { value: 'elysia-prisma', label: 'Elysia Prisma' },
                    { value: 'ai-generate', label: 'Generate from Text Prompt (AI)' }
                ],
                initialValue: 'base',
            }),
            aiPrompt: ({ results }) => {
                if (results.framework === 'ai-generate') {
                    return text({
                        message: 'Describe your project (e.g., Image processing with Python, Computer Vision basic setup):',
                        placeholder: 'I want a python project with opencv and numpy...',
                        validate: (v: string | undefined) => v?.trim() ? void 0 : 'Please provide details for the AI to generate.'
                    });
                }
                // หากไม่ได้เลือก AI ให้ข้าม (Resolve ผ่านไปเลย)
                return Promise.resolve();
            },

            docker: () => confirm({ message: 'Include Docker?', initialValue: true }),
            github: () => confirm({ message: 'Include GitHub Actions?', initialValue: true }),
            env: () => confirm({ message: 'Include Environment Variables?', initialValue: true }),
            docs: () => confirm({ message: 'Include README.md?', initialValue: true })
        },
        {
            onCancel: () => {
                cancel('Operation cancelled by user.');
                process.exit(0);
            }
        }
    );

    return options as ProjectOptions;
}