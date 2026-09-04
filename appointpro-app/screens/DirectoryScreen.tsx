import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import BottomTabBar, { TabKey } from '../components/BottomTabBar';

type FacultyStatus = 'available' | 'unavailable';

type FacultyMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: FacultyStatus;
};

const FACULTY: FacultyMember[] = [
  {
    id: '1',
    name: 'Prof. Maria Santos',
    role: 'Instructor',
    department: 'Mathematics',
    status: 'available',
  },
  {
    id: '2',
    name: 'Dr. Juan Dela Cruz',
    role: 'Instructor',
    department: 'Computer Studies',
    status: 'available',
  },
  {
    id: '3',
    name: 'Dr. Juan Dela Cruz',
    role: 'Instructor',
    department: 'Computer Studies',
    status: 'available',
  },
  {
    id: '4',
    name: 'Dr. Juan Dela Cruz',
    role: 'Instructor',
    department: 'Computer Studies',
    status: 'unavailable',
  },
  {
    id: '5',
    name: 'Dr. Juan Dela Cruz',
    role: 'Instructor',
    department: 'Computer Studies',
    status: 'available',
  },
];

type DirectoryScreenProps = {
  onMenuPress?: () => void;
  onFilterPress?: () => void;
  onSelectFaculty?: (faculty: FacultyMember) => void;
  onTabChange?: (tab: TabKey) => void;
};

export default function DirectoryScreen({
  onMenuPress,
  onFilterPress,
  onSelectFaculty,
  onTabChange,
}: DirectoryScreenProps) {
  const [query, setQuery] = useState('');

  const filtered = FACULTY.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="menu" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Directory</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search faculty..."
            placeholderTextColor="#9B9B9B"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <Ionicons name="options-outline" size={18} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onSelectFaculty?.(item)}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <FontAwesome5 name="user-tie" size={20} color={colors.white} />
            </View>
            <View style={styles.infoWrap}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.role}>
                {item.role} · {item.department}
              </Text>
              <Text
                style={[
                  styles.status,
                  item.status === 'available' ? styles.statusAvailable : styles.statusUnavailable,
                ]}
              >
                {item.status === 'available' ? 'Available' : 'Unavailable'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      />

      <BottomTabBar active="directory" onChange={onTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  headerSpacer: {
    width: 24,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textDark,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoWrap: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  role: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  statusAvailable: {
    color: colors.success,
  },
  statusUnavailable: {
    color: colors.danger,
  },
});