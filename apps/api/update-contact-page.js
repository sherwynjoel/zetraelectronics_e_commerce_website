const fs = require('fs');
const path = 'c:\\Users\\Sherwyn joel\\OneDrive\\Desktop\\Tech uc\\apps\\web\\src\\app\\(public)\\contact\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

const newBody = `        try {
            const response = await fetch(\`\${API_URL}/contact\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed');

            setSubmitting(false);
            setSubmitted(true);
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch (error) {
            console.error("Submission error:", error);
            alert("Sorry, your message could not be sent. Please try again later.");
            setSubmitting(false);
        }`;

// Using a more robust regex that ignores minor indentation/line-ending differences
const oldRegex = /\/\/ Simulate API call[\s\S]+?setFormData\(\{ name: "", email: "", subject: "", message: "" \}\);/;

if (oldRegex.test(content)) {
    const updatedContent = content.replace(oldRegex, newBody);
    fs.writeFileSync(path, updatedContent, 'utf8');
    console.log('Successfully updated contact page!');
} else {
    console.error('Could not find the original simulation code to replace.');
}
