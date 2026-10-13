// Einstellungen für das Einsammeln der Antworten.
// Variante 1 (empfohlen): Supabase. URL und "anon/publishable" Key eintragen (siehe README.md).
// Variante 2: leer lassen. Dann lädt jede Person am Ende eine Datei herunter und schickt sie an die neutrale Person.
window.CONFIG = {
  supabaseUrl: "",      // z. B. "https://abcdxyz.supabase.co"
  supabaseAnonKey: "",  // der öffentliche "anon" bzw. "publishable" Key, NICHT der service_role Key
  table: "antworten",
};
