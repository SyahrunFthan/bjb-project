import { checkAppVersion } from '@/api/appVersion';
import UpdateModal from '@/components/modals/UpdateModal';
import { AuthProvider } from '@/contexts/AuthContext';
import { FormProvider } from '@/contexts/FormContext';
import { ModalProvider } from '@/contexts/ModalContext';
import { navigationRef } from '@/lib/navigate';
import { AppVersionResponse } from '@/model/appVersion';
import Routes from '@/routers';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  const [updateData, setUpdateData] = useState<AppVersionResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const initVersionCheck = async () => {
      const res = await checkAppVersion();
      if (res && res.has_update) {
        setUpdateData(res);
        setModalVisible(true);
      }
    };

    initVersionCheck();
  }, []);

  return (
    <SafeAreaProvider>
      <ModalProvider>
        <AuthProvider>
          <FormProvider>
            <NavigationContainer ref={navigationRef}>
              <Routes />
            </NavigationContainer>
          </FormProvider>
        </AuthProvider>

        {updateData && (
          <UpdateModal
            visible={modalVisible}
            forceUpdate={updateData.force_update}
            title={updateData.title}
            message={updateData.message}
            latestVersionName={updateData.latest_version_name}
            notes={updateData.release_notes}
            updateUrl={updateData.update_url}
            onClose={() => setModalVisible(false)}
          />
        )}
      </ModalProvider>
    </SafeAreaProvider>
  );
};

export default App;

