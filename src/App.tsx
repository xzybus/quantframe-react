import './App.css'
import { DatabaseContextProvider, TauriContextProvider } from './contexts/index'
import AppRoutes from './layouts/routes'
import i18n from "i18next";
import { en } from './lang/en'
import { dk } from './lang/dk'
import { initReactI18next } from "react-i18next";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ModalsProvider } from '@mantine/modals';
import { createStyles } from '@mantine/core';
import { PromptModal } from './components/modals/prompt.modal';
import { settings, user, cache } from './store';
import { FileSystem } from '@utils/fileSystem';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      dk: { translation: dk },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

const useStyles = createStyles(() => ({
  header: {
    borderBottom: `1px gray solid `,
    padding: 10,
  },
}));

const modals = {
  prompt: PromptModal
  /* ...other modals */
};
declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}



// @ts-ignore
window.debug = async () => {
  const config = structuredClone(await settings.get())
  const cached = structuredClone(await cache.get())
  const currentUser = structuredClone(await user.get())
  console.log(await FileSystem.readTextFile("allItemData.csv"));

  // @ts-ignore
  delete config.user_password
  // @ts-ignore
  delete config.access_token

  console.group('Debug')
  console.log(`pathname: ${window.location.pathname}`)
  console.log(`settings: ${JSON.stringify(config, null, 2)}`)
  console.log('cache:', cached.tradableItems)
  console.log('user', currentUser)
  console.groupEnd()
}

function App() {
  const { classes } = useStyles();
  return (
    <QueryClientProvider client={queryClient}>
      <ModalsProvider
        modals={modals}

        modalProps={{
          centered: true,
          classNames: classes,
          onClose() {
            console.log("Modal closed");
          },
        }}>
        <TauriContextProvider>
          <DatabaseContextProvider>
            <AppRoutes />
          </DatabaseContextProvider>
        </TauriContextProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ModalsProvider>
    </QueryClientProvider>
  )
}

export default App
