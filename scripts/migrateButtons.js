const fs = require('fs');
const files = [
    'app/(auth)/login/page.tsx',
    'app/(auth)/signup/page.tsx',
    'app/profile/page.tsx',
    'components/onboarding/WelcomeStep.tsx',
    'components/onboarding/GoalStep.tsx',
    'components/onboarding/AboutStep.tsx',
    'components/onboarding/ActivityStep.tsx',
    'components/onboarding/ResultsStep.tsx'
].filter(f => fs.existsSync(f));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('<button') && !content.includes('TapButton')) {
        content = content.replace(/<button/g, '<TapButton');
        content = content.replace(/<\/button>/g, '</TapButton>');
        content = 'import { TapButton } from "@/components/ui/TapButton";\n' + content;
        fs.writeFileSync(file, content);
    }
});
