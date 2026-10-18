import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CreationEngineScreen from '../screens/CreationEngineScreen';
import TransformationEngineScreen from '../screens/TransformationEngineScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { TabIcon } from '../components/spec';
import { MainTabParamList } from './types';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Transformation"
      screenOptions={({ route }) => ({
        headerTitleAlign: 'left',
        headerStyle: { backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: colors.rule, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: colors.ink },
        tabBarActiveTintColor: colors.spec,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.rule },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ color }) => <TabIcon name={route.name} color={color} />,
      })}
    >
      <Tab.Screen
        name="Transformation"
        component={TransformationEngineScreen}
        options={{ title: 'Transformation Engine', tabBarLabel: 'Transform' }}
      />
      <Tab.Screen name="Creation" component={CreationEngineScreen} options={{ title: 'Creation Engine', tabBarLabel: 'Create' }} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
