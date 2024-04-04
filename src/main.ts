import { openai } from "./openai";
import "./style.css";

const form = document.querySelector("#generate-form") as HTMLFormElement;
const iframe = document.querySelector("#generated-code") as HTMLIFrameElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const prompt = formData.get("prompt") as string;

  if (!prompt) {
    alert("Veuillez entrer un prompt");
    return;
  }

  if (import.meta.env.VITE_OPEN_AI_KEY.length === 0) {
    alert("Veuillez renseigner la clé API OpenAI");
    return;
  }

  const response = await openai.chat.completions.create({
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
    stream: true, //for long running completions
  });

  let code = "";
  const onNewChunk = createTimedUpdateIframe();

  for await (const message of response) {
    //recording the token for the next message
    // and adding the content to the code
    const token = message.choices[0].delta.content;
    //streaming stops when the model is done
    // const isDone = message.choices[0].finish_reason === "stop";
    code += token;
    onNewChunk(code);
    // console.log(code);
  }

  if (!code) {
    alert("Erreur lors de la génération du code");
    return;
  }
});

const createTimedUpdateIframe = () => {
  let date = new Date();
  let timeOut: any = null;

  return (code: string) => {
    //only call updaetIframe if the last action was more than 1 second ago
    if (new Date().getTime() - date.getTime() < 1000) {
      updateIframe(code);
      return;
    }

    if (timeOut) {
      clearTimeout(timeOut);
    }

    timeOut = setTimeout(() => {
      updateIframe(code);
    }, 1000);
  };
};

const updateIframe = (code: string) => {
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
};
