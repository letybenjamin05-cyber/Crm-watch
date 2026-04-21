import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const watch = await req.json();

  const specs = [
    `Marque : ${watch.marque}`,
    `Modèle : ${watch.modele}`,
    watch.reference ? `Référence : ${watch.reference}` : null,
    watch.calibre ? `Calibre : ${watch.calibre}` : null,
    watch.diametre ? `Diamètre : ${watch.diametre} mm` : null,
    `État : ${watch.etat}`,
    `Full Set : ${watch.fullSet ? "Oui (boîte + papiers d'origine)" : "Non"}`,
    watch.notes ? `Notes : ${watch.notes}` : null,
  ].filter(Boolean).join("\n");

  const prompt = `Tu es un expert en montres vintage et horlogerie. Rédige une description d'annonce professionnelle en français pour cette montre, dans EXACTEMENT ce style :

EXEMPLE PARFAIT :
"Très belle Omega Genève automatique au design carré élégant, typique des montres vintage des années 70. Un modèle très recherché pour son style minimaliste et intemporel.
Le cadran présente une patine bien marquée, homogène et pleine de charme, qui renforce le caractère vintage de la montre. Les index appliqués ainsi que les aiguilles d'origine offrent une excellente lisibilité tout en conservant l'authenticité de la pièce.
Le boîtier est en parfait état, avec des arêtes nettes et une très belle présence au poignet.
Le mouvement automatique fonctionne parfaitement : bonne tenue de l'heure, remontage fluide, fiable au quotidien.
• Marque : Omega
• Modèle : Genève
• Calibre : 1012
• Diamètre : 35 mm
• État : Excellent
• Full Set : Non
Pièce rare et authentique, idéale pour un collectionneur ou un amateur de belles montres vintage."

RÈGLES STRICTES À RESPECTER :
- Intro : 2 phrases max — présente le style et pourquoi la montre est recherchée
- Corps : 2 à 3 phrases sur le cadran, le boîtier et/ou le mouvement — jamais plus
- Bullet points : reprendre EXACTEMENT les caractéristiques techniques fournies
- Conclusion : 1 phrase naturelle et passionnée
- ZÉRO hashtag, ZÉRO emoji, ZÉRO mention expédition/livraison/paiement
- Ton passionné et expert, jamais générique — adapte à la marque et à l'époque
- Utilise les informations des notes si elles sont pertinentes pour la description

Fiche de la montre :
${specs}`;

  const message = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ annonce: text });
}
