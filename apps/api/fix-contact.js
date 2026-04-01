const fs = require('fs');
const path = 'c:\\Users\\Sherwyn joel\\OneDrive\\Desktop\\Tech uc\\apps\\web\\src\\app\\(public)\\contact\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSubmitting(false);
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });`;

const newBlock = `        try {
            await fetch(\`\${API_URL}/contact\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setSubmitting(false);
            setSubmitted(true);
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch (error) {
            console.error("Submission error:", error);
            alert("Error sending message.");
            setSubmitting(false);
        }`;

// Use regex to normalize line endings and spaces just in case
const normalizedOld = oldBlock.replace(/\s+/g, ' ');
const normalizedContent = content.replace(/\s+/g, ' ');

if (normalizedContent.includes(normalizedOld)) {
    // If it matches normalized, let's do a more careful replace
    content = content.replace(oldBlock, newBlock);
} else {
    // Fallback: replace the whole function if possible
    console.log("Normalized match failed. Replacing lines 35-45...");
    const lines = content.split(/\r?\n/);
    lines.splice(34, 11, newBlock); // splice handles indices correctly
    content = lines.join('\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated contact page!');
