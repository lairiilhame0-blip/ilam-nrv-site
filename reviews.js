// Avis transmis par Ilam, sans note ni étoile.
const LIVE_REVIEWS = [
  { name: 'Marjo', paragraphs: [
    "Quand j'ai rencontré Ilam, j'étais à une période compliquée dans ma vie et j'avais commencé à aller à la salle de sport et à pratiquer la musculation seule.",
    "Je me rendais compte que je faisais mal les exercices et aussi qu'il me manquait quelque chose dans ma pratique, car je ne perdais pas de poids. J'avais besoin d'aide.",
    "Ilam m'a beaucoup aidé dans l'alimentation et dans ma pratique sportive. J'ai pu comprendre plein de choses avec ses conseils, tout l'accompagnement chaque semaine, toutes les corrections sur les exercices, et le temps passé derrière les programmes. Elle est patiente, à l'écoute, et elle me pousse à me surpasser et à sortir de ma zone de confort. Elle arrive à cerner mes faiblesses et à savoir comment les travailler. J'ai réussi à aimer des exercices que je fuyais !",
    "Ce n'est pas qu'à travers la perte de poids et la pratique sportive que tout a changé depuis son accompagnement, mais aussi au niveau du mental, de l'état d'esprit, de ma force et de ma confiance en moi.",
    "Voilà mon retour sur les coaching 🫶"
  ] },
  { name: 'Ummu', paragraphs: [
    "Alors, avoir Ilam en tant que coach : c'est se surpasser, être écoutée, sur ce qui vas pas et être conseillé, pour atteindre des objectifs. Et toujours plus"
  ] },
  { name: 'Samira', paragraphs: [
    "Ilam est une coach bienveillante et à l'écoute qui croit en son élève plus que l'élève elle-même; elle est d'une aide précieuse même à distance et toujours disponible.",
    "Elle réajuste ce qui doit l'être en adaptant vraiment à la personne, à ses objectifs, ses éventuelles blessures. C'est un coaching individualisé et personnalisé.",
    "Grâce à elle j'ai pu perdre du poids et retrouver une silhouette plus harmonieuse même si il y a encore du travail.",
    "J'ai pu également me dépasser quand ça a été nécessaire."
  ] },
  { name: 'Sabrina', paragraphs: [
    "Pour ma part, le mois prochain ça fera un an que j’ai commencé les coachings avec toi !",
    "À la base, mon objectif était assez simple : découvrir les machines et apprendre à les utiliser, parce que je n’avais absolument jamais mis les pieds dans une salle de sport et que je pratiquais 0 activité physique. Finalement ton accompagnement m’a apporté bien plus que ce que j’imaginais.",
    "En faite je suis arrivée à une période un peu particulière de ma vie, avec je pense beaucoup de choses à évacuer. D’ailleurs mes premières séances se terminaient souvent en larmes! 🫣🫣 Quelques mois plus tard, je prenais la décision de quitter mon travail 😂😂 et mes objectifs ont complètement évolué.",
    "Au fil des séances avec toi , tu m’as aidée à me dépasser, à découvrir des capacités que je ne soupçonnais pas et surtout à prendre conscience de l’importance de prendre soin de moi. Le tout en répondant à mes milles questions par seance ! 🤨🤪",
    "Blague à part ce qui me marque le plus aujourd’hui c’est de voir à quel point tout ça a changé mon quotidien. Que ce soit en cuisinant, en jardinant ou même pendant les vacances avec mes enfants cet été, je me suis rendu compte que beaucoup de gestes étaient devenus plus simples, plus faciles, plus fluides. Ce sont des petites choses mais qui font une vraie différence au quotidien."
  ] }
];
(function () {
  const section = document.querySelector('#avis');
  const grid = document.querySelector('#review-grid');
  const nav = document.querySelector('.main-nav');
  if (!section || !grid || !LIVE_REVIEWS.length) return;
  LIVE_REVIEWS.forEach((review) => {
    const card = document.createElement('figure');
    card.className = 'review-card';
    const quote = document.createElement('blockquote');
    review.paragraphs.forEach((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      quote.append(paragraph);
    });
    const caption = document.createElement('figcaption');
    const name = document.createElement('strong');
    name.textContent = review.name;
    caption.append(name);
    card.append(quote, caption);
    grid.append(card);
  });
  section.hidden = false;
  if (nav && !nav.querySelector('a[href="#avis"]')) {
    const link = document.createElement('a');
    link.href = '#avis';
    link.textContent = 'Avis';
    nav.insertBefore(link, nav.querySelector('a[href="#contact"]'));
  }
})();
