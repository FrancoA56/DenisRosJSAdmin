<template>
  <div>
    <a-form
      :model="formState"
      :rules="rules"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-form-item label="Nombre" name="name">
        <a-input v-model:value="formState.name" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">Guardar</a-button>
        <a-button style="margin-left: 10px" @click="goBack">Cancelar</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { createCategory, updateCategory, getCategoryById } from '../../services/category';
import { message } from 'ant-design-vue';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();

    const formState = reactive({
      name: '',
    });

    const rules = {
      name: [
        { required: true, message: 'Por favor ingresa el nombre de la categoría', trigger: 'blur' },
        { min: 3, message: 'El nombre debe tener al menos 3 caracteres', trigger: 'blur' }
      ]
    };

    const isEditMode = route.params.id ? true : false;
    const categoryId = route.params.id;

    const fetchCategory = async (id) => {
      try {
        const response = await getCategoryById(id);
        formState.name = response.data.name;
      } catch (error) {
        message.error('Error al cargar la categoría');
        console.error(error);
      }
    };

    const onFinish = async (values) => {
      try {
        if (isEditMode) {
          await updateCategory(categoryId, { name: values.name });
          message.success('Categoría actualizada correctamente');
        } else {
          await createCategory({ name: values.name });
          message.success('Categoría creada correctamente');
        }
        router.push('/dashboard/categories');
      } catch (error) {
        if (error.response) {
          if (error.response.status === 409) {
            message.error('Ya existe una categoría con ese nombre');
          } else {
            message.error('Error al guardar la categoría');
          }
        } else {
          message.error('Error de conexión');
        }
        console.error(error);
      }
    };

    const onFinishFailed = (errors) => {
      console.log('Errores de validación:', errors);
    };

    const goBack = () => {
      router.push('/dashboard/categories');
    };

    onMounted(() => {
      if (isEditMode) {
        fetchCategory(categoryId);
      }
    });

    return {
      formState,
      rules,
      onFinish,
      onFinishFailed,
      goBack,
    };
  },
};
</script>