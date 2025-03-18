<template>
  <div>
    <h1>Panel de Administración</h1>
    <a-button @click="handleLogout">Cerrar sesión</a-button>
  </div>
</template>

<script>
import { logout } from '../services/auth';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();

    const handleLogout = () => {
      logout();
      router.push('/login');
    };

    return { handleLogout };
  },
};
</script>