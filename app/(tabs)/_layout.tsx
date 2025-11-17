// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';



export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}>
      <Tabs.Screen
        name="resumen"
        options={{
          title: 'Resumen',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="alert" size={size} color="color" />
          //  <IconSymbol name="chart.bar.fill" size={size} color={color} />
          ),
        }}
      /> 
      <Tabs.Screen
        name="pacientes"
        options={{
          title: 'Pacientes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-circle-outline" size={size} color="color" />
            // <IconSymbol name="person.2.fill" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sillones"
        options={{
          title: 'Sillones',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="couch" size={size} color="color" /> 
           /* <FontAwesome6 name="couch" size={24} color="black" /> */
           /* <IconSymbol name="bed.double.fill" size={size} color={color} />   */
          ),
        }}
      />
      <Tabs.Screen
        name="configuracion"
        options={{
          title: 'Configuración',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="gears" size={size} color="black" />
          //  <IconSymbol name="gear" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}