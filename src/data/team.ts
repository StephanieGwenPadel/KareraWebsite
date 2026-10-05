// The studio's people and pages. Fill these in — the Team section and the footer both read from here.

export type Member = { name: string; role: string; email: string; info?: string; photo?: string };

export const team: Member[] = [
  { name: 'Robb Julian Olazo', role: 'Assistant Game Developer & Game Designer', email: 'robbjullian730@gmail.com', photo: '/team/olazo.webp' },
  { name: 'John Hensly Santos', role: 'Assistant Game Developer & Trailer Editor', email: 'hensley.santos9@gmail.com', photo: '/team/hensly.webp' },
  { name: 'John Gabriel Delicana', role: 'Project Leader', email: 'delicanagabriel1212@gmail.com', photo: '/team/gabriel.webp' },
  { name: 'Juan Paolo Peralta', role: 'Assistant Game Developer', email: 'paoloperalta246@gmail.com', photo: '/team/paolo.webp' },
  { name: 'Stephanie Gwen Padel', role: 'Asset Designer / Web Developer & Researcher', email: 'stephaniepdl2@gmail.com', photo: '/team/stephanie.webp' },
];

export const socials = {
  facebook: 'https://www.facebook.com/',
  instagram: 'https://www.instagram.com/',
  tiktok: 'https://www.tiktok.com/',
};

export const school = {
  university: 'Bulacan State University - Bustos Campus',
  section: 'BSIT 4DG2',
};
