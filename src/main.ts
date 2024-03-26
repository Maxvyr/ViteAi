import { openai } from "./openai";
import "./style.css";

const form = document.querySelector("#generate-form") as HTMLFormElement;
const iframe = document.querySelector("#generated-code") as HTMLIFrameElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const prompt = formData.get("prompt") as string;

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `Tu crées des sites web avec Tailwind. Ta tâche est généré du code html avec tailwind en fonction du prompt de l'utilisateur. Tu renvoie uniquement du HTML sans aucun text avant ou après. Tu renvoie du HTML valide. Tu n'ajoutes jamais de syntaxe markdown.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  console.log(chatCompletion);
  const code = chatCompletion.choices[0].message.content;

  if (!code) {
    alert("Erreur lors de la génération du code");
    return;
  }

  iframe.srcdoc = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Generated Code</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        ${code}
      </body>
  `;
});
