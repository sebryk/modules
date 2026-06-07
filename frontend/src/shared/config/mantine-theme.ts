import { colorsTuple, createTheme } from '@mantine/core'

const brand = colorsTuple([
   '#eef4ff',
   '#dbe7ff',
   '#b8d0ff',
   '#8bb2ff',
   '#6495ff',
   '#4b80f5',
   '#346ee3',
   '#2358c7',
   '#1c469f',
   '#16387d',
])

const mantineTheme = createTheme({
   fontFamily: 'Inter Variable, sans-serif',
   headings: {
      fontFamily: 'Geist Variable, Inter Variable, sans-serif',
      fontWeight: '600',
   },
   primaryColor: 'brand',
   colors: {
      brand,
   },
   primaryShade: {
      light: 6,
      dark: 8,
   },
   defaultRadius: 'md',
})

export { mantineTheme }
