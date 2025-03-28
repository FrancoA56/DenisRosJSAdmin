<template>
  <a-modal
    :visible="visible"
    :title="mode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'"
    :width="600"
    :style="{ top: '50px', paddingBottom: '0' }"
    :footer="null"
    @cancel="$emit('cancel')"
  >
    <a-form 
      :model="formState" 
      :rules="rules" 
      layout="vertical"
      ref="formRef"
      @finish="handleSubmit"
    >
      <a-row :gutter="16" v-if="mode === 'edit'">
        <a-col :span="12">
          <a-form-item label="Nombre" name="firstName">
            <a-input v-model:value="formState.firstName" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Apellido" name="lastName">
            <a-input v-model:value="formState.lastName" />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-form-item 
        label="Email" 
        name="email"
        v-if="mode === 'create'"
      >
        <a-input 
          v-model:value="formState.email" 
          :disabled="mode === 'edit'"
        />
      </a-form-item>
      
      <a-form-item 
        v-if="mode === 'create'" 
        label="Contraseña" 
        name="password"
      >
        <a-input-password v-model:value="formState.password" />
      </a-form-item>
      
      <a-form-item 
        v-if="mode === 'create'" 
        label="Rol" 
        name="role"
      >
        <a-select v-model:value="formState.role">
          <a-select-option value="CLIENTE">Cliente</a-select-option>
          <a-select-option value="GESTOR">Gestor</a-select-option>
          <a-select-option value="ADMIN">Administrador</a-select-option>
        </a-select>
      </a-form-item>
      
      <template v-if="mode === 'edit'">
        <a-form-item label="Teléfono" name="phone">
          <a-input v-model:value="formState.phone" />
        </a-form-item>
        
        <a-form-item label="Fecha de Nacimiento" name="bday">
          <a-date-picker 
            v-model:value="formState.bday" 
            style="width: 100%" 
            :disabledDate="disabledDate"
          />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="Provincia" name="provincia">
              <a-input v-model:value="formState.provincia" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Ciudad" name="ciudad">
              <a-input v-model:value="formState.ciudad" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Código Postal" name="codigoPostal">
              <a-input v-model:value="formState.codigoPostal" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="16">
            <a-form-item label="Dirección" name="direccion">
              <a-input v-model:value="formState.direccion" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Número" name="numeroDireccion">
              <a-input v-model:value="formState.numeroDireccion" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>

      <a-form-item :wrapper-col="{ span: 24, offset: 0 }" style="margin-top: 24px">
        <a-button type="primary" html-type="submit" :loading="loading">
          {{ mode === 'create' ? 'Crear' : 'Actualizar' }}
        </a-button>
        <a-button style="margin-left: 10px" @click="$emit('cancel')">
          Cancelar
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { ref, watch, toRaw } from "vue";
import { message } from "ant-design-vue";
import dayjs from 'dayjs';

export default {
  props: {
    visible: Boolean,
    user: Object,
    mode: {
      type: String,
      validator: (value) => ['create', 'edit'].includes(value),
      default: 'create'
    }
  },
  
  emits: ['submit', 'cancel'],
  
  setup(props, { emit }) {
    const formRef = ref();
    const loading = ref(false);
    
    // Expresión regular para validar teléfono internacional
    const phoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
    
    const formState = ref({
      // Campos para edición
      id: null,
      firstName: '',
      lastName: '',
      phone: '',
      bday: undefined,
      provincia: '',
      ciudad: '',
      direccion: '',
      numeroDireccion: '',
      codigoPostal: '',
      
      // Campos para creación
      email: '',
      password: '',
      role: 'Cliente'
    });
    
    // Reglas de validación
    const rules = {
      firstName: [
        { required: true, message: 'Por favor ingrese el nombre', whitespace: true },
        { max: 50, message: 'Máximo 50 caracteres' }
      ],
      lastName: [
        { required: true, message: 'Por favor ingrese el apellido', whitespace: true },
        { max: 50, message: 'Máximo 50 caracteres' }
      ],
      email: [
        { required: true, message: 'Por favor ingrese el email' },
        { type: 'email', message: 'Ingrese un email válido' },
        { max: 100, message: 'Máximo 100 caracteres' }
      ],
      password: [
        { required: true, message: 'Por favor ingrese la contraseña' },
        { min: 6, message: 'Mínimo 6 caracteres' },
        { max: 50, message: 'Máximo 50 caracteres' }
      ],
      phone: [
        { 
          pattern: phoneRegex,
          message: 'Formato internacional requerido: +[código país][número]' 
        }
      ],
      bday: [
        { 
          validator: (_, value) => {
            if (!value) return Promise.resolve();
            const date = dayjs(value);
            if (date.isAfter(dayjs())) {
              return Promise.reject('La fecha no puede ser futura');
            }
            return Promise.resolve();
          }
        }
      ],
      provincia: [
        { max: 50, message: 'Máximo 50 caracteres' }
      ],
      ciudad: [
        { max: 50, message: 'Máximo 50 caracteres' }
      ],
      direccion: [
        { max: 100, message: 'Máximo 100 caracteres' }
      ],
      numeroDireccion: [
        { max: 20, message: 'Máximo 20 caracteres' }
      ],
      codigoPostal: [
        { max: 10, message: 'Máximo 10 caracteres' }
      ],
      role: [
        { required: true, message: 'Por favor seleccione un rol' }
      ]
    };
    
    // Deshabilitar fechas futuras
    const disabledDate = current => {
      return current && current > dayjs().endOf('day');
    };
    
    const parseDate = (date) => {
      if (!date) return undefined;
      if (dayjs.isDayjs(date)) return date;
      if (date instanceof Date) return dayjs(date);
      return dayjs(date, 'YYYY-MM-DD');
    };

    watch(() => props.user, (newUser) => {
      if (newUser) {
        const userData = { ...newUser };
        // Manejo especial para la fecha
        userData.bday = newUser.bday ? parseDate(newUser.bday) : undefined;
        formState.value = { 
          ...formState.value,
          ...userData
        };
      } else {
        // Reset más completo
        formState.value = {
          id: null,
          firstName: '',
          lastName: '',
          phone: '',
          bday: undefined,
          provincia: '',
          ciudad: '',
          direccion: '',
          numeroDireccion: '',
          codigoPostal: '',
          email: '',
          password: '',
          role: 'Cliente'
        };
      }
    }, { immediate: true });

    const handleCancel = () => {
      // Limpiar el formulario al cancelar
      formRef.value?.resetFields();
      emit('cancel');
    };

    const handleSubmit = async () => {
      try {
        loading.value = true;
        await formRef.value.validate();
        
        const formData = toRaw(formState.value);
        let dataToSend;
        
        if (props.mode === 'edit') {
          dataToSend = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            bday: formData.bday ? dayjs(formData.bday).format('YYYY-MM-DD') : null,
            provincia: formData.provincia,
            ciudad: formData.ciudad,
            direccion: formData.direccion,
            numeroDireccion: formData.numeroDireccion,
            codigoPostal: formData.codigoPostal
          };
        } else {
          dataToSend = {
            email: formData.email,
            password: formData.password,
            role: formData.role
          };
        }
        
        emit('submit', {
          id: formData.id,
          ...dataToSend
        });
        
      } catch (error) {
        console.error('Error en el formulario:', error);
        message.error('Error al procesar el formulario');
      } finally {
        loading.value = false;
      }
    };
    
    return {
      formRef,
      formState,
      rules,
      loading,
      disabledDate,
      handleSubmit,
      handleCancel
    };
  }
};
</script>