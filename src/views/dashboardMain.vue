<template>
  <a-layout style="min-height: 100vh">
    <!-- Barra lateral - Ahora ocupa todo el alto y ancho -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      :style="{
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }"
    >
      <div class="logo-container" v-if="!collapsed">
        <h3 class="logo-text">Denis & Ros</h3>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        :inline-collapsed="collapsed"
      >
        <a-menu-item key="1">
          <template #icon>
            <unordered-list-outlined />
          </template>
          <router-link to="/dashboard/categories">Categorías</router-link>
        </a-menu-item>
        <a-menu-item key="2">
          <template #icon> <TagOutlined /> </template>
          <router-link to="/dashboard/brands">Marcas</router-link>
        </a-menu-item>
        <a-menu-item key="3">
          <template #icon>
            <UserOutlined />
          </template>
          <router-link to="/dashboard/users">Usuarios</router-link>
        </a-menu-item>
        <a-menu-item key="4">
          <template #icon>
            <shopping-outlined />
          </template>
          <router-link to="/dashboard/products">Productos</router-link>
        </a-menu-item>
        <a-menu-item key="5">
          <template #icon>
            <MessageOutlined />
          </template>
          <router-link to="/dashboard/review">Reviews</router-link>
        </a-menu-item>
        <a-menu-item key="6">
          <template #icon> <ShoppingCartOutlined /> </template>
          <router-link to="/dashboard/invoice">Compras</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- Contenido principal -->
    <a-layout :style="{ marginLeft: collapsed ? '80px' : '200px' }">
      <!-- Header más delgado y profesional -->
      <a-layout-header
        :style="{
          background: '#fff',
          padding: '0 24px',
          height: '48px',
          lineHeight: '48px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 90,
        }"
      >
        <a-button type="text" @click="handleLogout">
          <template #icon>
            <logout-outlined />
          </template>
          Cerrar sesión
        </a-button>
      </a-layout-header>

      <!-- Área de contenido con mejor espaciado -->
      <a-layout-content
        :style="{
          margin: '16px 16px 0',
          padding: 24,
          background: '#fff',
          minHeight: 'calc(100vh - 80px)',
        }"
      >
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { logout } from "../services/auth";
import {
  UnorderedListOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TagOutlined,
  MessageOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";

export default {
  components: {
    UnorderedListOutlined,
    ShoppingOutlined,
    TagOutlined,
    MessageOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    LogoutOutlined,
  },
  setup() {
    const router = useRouter();
    const selectedKeys = ref(["1"]);
    const collapsed = ref(false);

    const handleLogout = () => {
      logout();
      router.push("/login");
    };

    return {
      selectedKeys,
      collapsed,
      handleLogout,
    };
  },
};
</script>

<style scoped>
/* Estilo para el logo/header del sidebar */
.logo-container {
  height: 64px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.logo-text {
  color: white;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

/* Transición suave para el sidebar */
.ant-layout-sider {
  transition: all 0.2s ease;
}

/* Estilo para el botón de logout */
.ant-btn-text {
  color: rgba(0, 0, 0, 0.85);
}

.ant-btn-text:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
