const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

export async function fetchWord(difficulty, giveHint, theme = "general") {
  const lvl = difficulty === "easy"
    ? "muy sencilla y cotidiana para niños"
    : difficulty === "hard"
    ? "más específica y elaborada"
    : "moderada, ni muy fácil ni muy difícil";

  let themePrompt = "";
  if (theme === "soccer") {
    themePrompt = `
Reglas de la categoría "Deportistas y Fútbol" ⚽:
- La palabra secreta DEBE ser un futbolista famoso mundialmente (activo o retirado), equipo legendario, deportista de renombre o concepto deportivo muy reconocido.
- Ejemplos: Messi, Cristiano Ronaldo, Maradona, Real Madrid, Michael Jordan, Balón de oro, Neymar, Mbappe, Barcelona.
`;
  } else if (theme === "movies") {
    themePrompt = `
Reglas de la categoría "Cine y Series" 🎬:
- La palabra secreta DEBE ser una película clásica o taquillera, personaje cinematográfico memorable, serie de TV muy popular o director de cine famoso.
- Ejemplos: Titanic, Harry Potter, Darth Vader, Batman, Shrek, Iron Man, Simpson, Marvel, Stranger Things.
`;
  } else if (theme === "anime") {
    themePrompt = `
Reglas de la categoría "Geek y Anime" 🎮:
- La palabra secreta DEBE ser un anime de renombre, personaje de anime/manga popular, videojuego clásico o elemento de la cultura geek.
- Ejemplos: Goku, Naruto, Pokemon, Pikachu, Super Mario Bros, Minecraft, Dragon Ball, Sailor Moon, Link.
`;
  } else {
    themePrompt = `
Reglas de la categoría "Cultura General" 🌐:
- La palabra secreta DEBE ser un concepto, animal, objeto, profesión, lugar o alimento estándar, ideal para todo público.
- Ejemplos: Gato, Pizza, Volcán, Bicicleta, Doctor, Guitarra, Astronauta, París.
`;
  }

  const hintInstruction = giveHint 
    ? `"impostorHint": "Una pista relacionada pero diferente en la misma categoría (ej: si la palabra es 'Messi', la pista podría ser 'Cristiano Ronaldo' o 'Maradona'. Si es 'Titanic', la pista podría ser 'Avatar'. Debe ser similar pero NO igual)"`
    : `"impostorHint": null`;

  const prompt = `Genera UNA palabra secreta para el juego "El Impostor".

Devuelve SOLO este JSON (sin markdown, sin texto extra):
{
  "word": "La palabra o nombre secreto",
  "category": "La subcategoría específica (ej: Futbolistas, Películas de animación, Personaje de Anime, Animales)",
  "emoji": "Un emoji que represente la palabra",
  ${hintInstruction}
}

Reglas generales:
- La palabra debe ser de dificultad ${lvl}.
- Debe ser un elemento o personaje muy popular o fácil de describir sin decir el nombre.
${themePrompt}
${giveHint ? "- La pista del impostor debe estar en la misma subcategoría pero ser DIFERENTE (ej: Goku→Vegeta, Messi→Neymar, Spiderman→Batman, Gato→Perro)" : ""}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      max_tokens: 300,
      temperature: 1.1,
      messages: [
        { 
          role: "system", 
          content: "Responde SOLO con JSON válido. Sin markdown. Sin explicaciones." 
        },
        { 
          role: "user", 
          content: prompt 
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Error ${res.status}`);
  
  const data = await res.json();
  let text = data.choices?.[0]?.message?.content || "";
  const m = text.match(/\{[\s\S]*\}/);
  
  if (!m) throw new Error("Respuesta inválida");
  
  return JSON.parse(m[0]);
}
