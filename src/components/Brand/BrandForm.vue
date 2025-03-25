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
        <a-form-item label="Logo" name="logo">
          <a-input v-model:value="formState.logo" />
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
  import { createBrand, updateBrand, getBrandById } from '../../services/brand';
  import { message } from 'ant-design-vue';
  
  export default {
    setup() {
      const router = useRouter();
      const route = useRoute();
  
      const formState = reactive({
        name: '',
        logo: ''
      });
  
      const rules = {
        name: [
          { required: true, message: 'Por favor ingresa el nombre de la marca', trigger: 'blur' },
          { min: 3, message: 'El nombre debe tener al menos 3 caracteres', trigger: 'blur' }
        ]
      };
  
      const isEditMode = route.params.id ? true : false;
      const brandId = route.params.id;
  
      const fetchBrand = async (id) => {
        try {
          const response = await getBrandById(id);
          formState.name = response.data.name;
          formState.logo = response.data.logo;
        } catch (error) {
          message.error('Error al cargar la categoría');
          console.error(error);
        }
      };
  
      const onFinish = async (values) => {
        try {
          if (isEditMode) {
            await updateBrand(brandId, { name: values.name, logo: values.logo });
            message.success('Marca actualizada correctamente');
          } else {
            await createBrand({ name: values.name, logo: values.logo });
            message.success('Marca creada correctamente');
          }
          router.push('/dashboard/brands');
        } catch (error) {
          if (error.response) {
            if (error.response.status === 409) {
              message.error('Ya existe una marca con ese nombre');
            } else {
              message.error('Error al guardar la marca');
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
        router.push('/dashboard/brands');
      };
  
      onMounted(() => {
        if (isEditMode) {
            fetchBrand(brandId);
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