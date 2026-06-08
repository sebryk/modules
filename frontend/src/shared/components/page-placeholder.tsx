import { Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { Clock3Icon } from 'lucide-react'

type PagePlaceholderProps = {
   title: string
   description: string
}

const PagePlaceholder = ({ title, description }: PagePlaceholderProps) => {
   return (
      <Paper p="xl" radius="lg" shadow="sm" withBorder={true}>
         <Stack gap="md" maw={560}>
            <ThemeIcon size={44} radius="md" variant="light">
               <Clock3Icon size={22} />
            </ThemeIcon>
            <Stack gap={6}>
               <Title order={2}>{title}</Title>
               <Text size="sm" c="dimmed">
                  {description}
               </Text>
            </Stack>
            <Text size="sm">
               Эта страница временно упрощена на время миграции на Mantine. Контент вернётся
               следующим этапом.
            </Text>
         </Stack>
      </Paper>
   )
}

export { PagePlaceholder }
