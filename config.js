// Einstellungen für das Einsammeln der Antworten.
// Variante 1 (empfohlen): Supabase. URL und "anon/publishable" Key eintragen (siehe README.md).
// Variante 2: leer lassen. Dann lädt jede Person am Ende eine Datei herunter und schickt sie an die neutrale Person.
window.CONFIG = {
  supabaseUrl: "https://lmqyircrmlcfpnmakhgo.supabase.co",      // z. B. "https://abcdxyz.supabase.co"
  supabaseAnonKey: "sb_publishable_QCe2SSiTfErou3AvdbSN5A_vzbvXabJ",  // der öffentliche "anon" bzw. "publishable" Key, NICHT der service_role Key
  table: "antworten",
};
