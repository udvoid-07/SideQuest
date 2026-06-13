import { Tabs } from 'expo-router'
import { LayoutDashboard, Map, User } from 'lucide-react-native'
import { View } from 'react-native'

const C = { void: '#321847', ember: '#f15153', ash: '#6B5080', bg: '#0f0716' }

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(15,7,22,0.97)',
          borderTopColor: 'rgba(255,255,255,0.07)',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor:   C.ember,
        tabBarInactiveTintColor: C.ash,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? {
              backgroundColor: 'rgba(241,81,83,0.15)',
              borderRadius: 10, padding: 4,
            } : undefined}>
              <LayoutDashboard size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: 'Quests',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? {
              backgroundColor: 'rgba(241,81,83,0.15)',
              borderRadius: 10, padding: 4,
            } : undefined}>
              <Map size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? {
              backgroundColor: 'rgba(241,81,83,0.15)',
              borderRadius: 10, padding: 4,
            } : undefined}>
              <User size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  )
}
