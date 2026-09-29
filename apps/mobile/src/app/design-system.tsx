import { spacing } from '@gfg/ui';
import { Badge, Button, Card, Divider, Input, Text, useTheme } from '@gfg/ui/native';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

/**
 * Catálogo do design system — só em modo de desenvolvimento (Expo Go / `pnpm dev`).
 * Serve para conferir os componentes nos temas claro e escuro. Não é uma tela do produto:
 * na versão publicada, esta rota volta para o início.
 */
export default function DesignSystemScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text variant="title">{t('mobile.designSystem.title')}</Text>
      <Text tone="muted">{t('mobile.designSystem.intro')}</Text>

      <Text variant="subtitle">{t('mobile.designSystem.typography')}</Text>
      <Card>
        <Text variant="title">{t('mobile.designSystem.titleSample')}</Text>
        <Text variant="subtitle">{t('mobile.designSystem.subtitleSample')}</Text>
        <Text>{t('mobile.designSystem.bodySample')}</Text>
        <Text variant="label">{t('mobile.designSystem.labelSample')}</Text>
        <Text variant="caption" tone="muted">
          {t('mobile.designSystem.captionSample')}
        </Text>
      </Card>

      <Text variant="subtitle">{t('mobile.designSystem.buttons')}</Text>
      <Card>
        <View style={styles.row}>
          <Button label={t('mobile.designSystem.primary')} />
          <Button variant="secondary" label={t('mobile.designSystem.secondary')} />
          <Button variant="ghost" label={t('mobile.designSystem.ghost')} />
          <Button variant="danger" label={t('mobile.designSystem.danger')} />
        </View>
        <Divider space="sm" />
        <View style={styles.row}>
          <Button label={t('mobile.designSystem.primary')} loading />
          <Button label={t('mobile.designSystem.disabled')} disabled />
        </View>
      </Card>

      <Text variant="subtitle">{t('mobile.designSystem.inputs')}</Text>
      <Card style={styles.stack}>
        <Input
          label={t('mobile.designSystem.inputLabel')}
          placeholder={t('mobile.designSystem.inputPlaceholder')}
          hint={t('mobile.designSystem.inputHint')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label={t('mobile.designSystem.inputLabel')}
          defaultValue="abc@"
          error={t('mobile.designSystem.inputError')}
        />
        <Input
          label={t('mobile.designSystem.inputLabel')}
          placeholder={t('mobile.designSystem.disabled')}
          disabled
        />
      </Card>

      <Text variant="subtitle">{t('mobile.designSystem.badges')}</Text>
      <Card>
        <View style={styles.row}>
          <Badge label={t('mobile.designSystem.badgeNeutral')} />
          <Badge label={t('mobile.designSystem.badgeBrand')} tone="brand" />
          <Badge label={t('mobile.designSystem.badgeSuccess')} tone="success" />
          <Badge label={t('mobile.designSystem.badgeWarning')} tone="warning" />
          <Badge label={t('mobile.designSystem.badgeDanger')} tone="danger" />
        </View>
      </Card>

      <Text variant="subtitle">{t('mobile.designSystem.cards')}</Text>
      <Card>
        <Text>{t('mobile.designSystem.cardText')}</Text>
      </Card>

      <Button
        variant="secondary"
        label={t('mobile.designSystem.back')}
        onPress={() => router.back()}
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, padding: spacing.xl, paddingTop: spacing.xxxl },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stack: { gap: spacing.lg },
});
