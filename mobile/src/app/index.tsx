import { StyleSheet, Text, View } from 'react-native';

// Tela provisória da Fase 0 — só confirma que o app abre.
// As funcionalidades (receitas, produtos etc.) entram nas próximas fases.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌍</Text>
      <Text style={styles.title}>Global Food Guide</Text>
      <Text style={styles.subtitle}>Em construção — Fase 0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F5F0',
    padding: 24,
  },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#1F6F5C' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
});
