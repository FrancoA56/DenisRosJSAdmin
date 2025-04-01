<template>
  <a-modal
    :title="mode === 'create' ? 'Crear Producto' : 'Editar Producto'"
    :visible="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="80%"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
      @finish="handleSubmit"
    >
      <a-row :gutter="24">
        <!-- Columna izquierda -->
        <a-col :span="12">
          <!-- Información básica -->
          <a-card title="Información Básica" class="mb-4">
            <a-form-item label="Nombre" name="name">
              <a-input v-model:value="formState.name" />
            </a-form-item>

            <a-form-item label="SKU" name="sku">
              <a-input v-model:value="formState.sku" />
            </a-form-item>

            <a-form-item label="Descripción Corta" name="shortDesc">
              <a-textarea v-model:value="formState.shortDesc" :rows="3" />
            </a-form-item>

            <a-form-item label="Descripción Larga" name="longDesc">
              <a-textarea v-model:value="formState.longDesc" :rows="5" />
            </a-form-item>

            <a-form-item label="Precio Base" name="basePrice">
              <a-input-number
                v-model:value="formState.basePrice"
                :min="0"
                :precision="2"
                style="width: 100%"
                addon-before="$"
              />
            </a-form-item>
          </a-card>

          <!-- Categoría y Marca -->
          <a-card title="Clasificación" class="mb-4">
            <a-form-item label="Categoría" name="categoryId">
              <a-select
                v-model:value="formState.categoryId"
                placeholder="Seleccione una categoría"
                allow-clear
              >
                <a-select-option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="Marca" name="brandId">
              <a-select
                v-model:value="formState.brandId"
                placeholder="Seleccione una marca"
                allow-clear
              >
                <a-select-option
                  v-for="brand in brands"
                  :key="brand.id"
                  :value="brand.id"
                >
                  {{ brand.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-card>
        </a-col>

        <!-- Columna derecha -->
        <a-col :span="12">
          <!-- Galería de imágenes -->
          <a-card title="Galería de Imágenes" class="mb-4">
            <a-upload
              v-model:file-list="galleryFiles"
              list-type="picture-card"
              :multiple="true"
              :before-upload="beforeUpload"
              @preview="handlePreview"
              @change="handleGalleryChange"
              :custom-request="dummyUpload"
            >
              <div v-if="galleryFiles.length < 10">
                <plus-outlined />
                <div class="ant-upload-text">Subir</div>
              </div>
            </a-upload>
          </a-card>

          <!-- Dimensiones y peso -->
          <a-card title="Dimensiones y Peso" class="mb-4">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="Peso (kg)" name="baseWeight">
                  <a-input-number
                    v-model:value="formState.baseWeight"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Largo (cm)" name="baseLength">
                  <a-input-number
                    v-model:value="formState.baseLength"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="Ancho (cm)" name="baseWidth">
                  <a-input-number
                    v-model:value="formState.baseWidth"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Alto (cm)" name="baseHeight">
                  <a-input-number
                    v-model:value="formState.baseHeight"
                    :min="0"
                    :precision="2"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>

          <!-- Estado -->
          <a-card title="Estado">
            <a-form-item name="isDisabled">
              <a-checkbox v-model:checked="formState.isDisabled">
                Producto desactivado
              </a-checkbox>
            </a-form-item>
          </a-card>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>

  <!-- Preview de imágenes -->
  <a-modal
    :visible="previewVisible"
    :title="previewTitle"
    :footer="null"
    @cancel="handlePreviewCancel"
  >
    <img alt="example" style="width: 100%" :src="previewImage" />
  </a-modal>
</template>

<script>
import { ref, reactive, watch } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export default {
  components: {
    PlusOutlined,
  },

  props: {
    visible: Boolean,
    product: {
      type: Object,
      required: true,
      default: () => ({
        name: "",
        sku: "",
        shortDesc: "",
        longDesc: "",
        basePrice: 0,
        categoryId: null,
        brandId: null,
        isDisabled: false,
        gallery: [],
        baseWeight: null,
        baseLength: null,
        baseWidth: null,
        baseHeight: null,
      }),
    },
    mode: {
      type: String,
      default: "create",
      validator: (value) => ["create", "edit"].includes(value),
    },
    categories: {
      type: Array,
      required: true,
      default: () => [],
    },
    brands: {
      type: Array,
      required: true,
      default: () => [],
    },
  },

  emits: ["submit", "cancel"],

  setup(props, { emit }) {
    const formRef = ref();
    const confirmLoading = ref(false);
    const galleryFiles = ref([]);
    const previewVisible = ref(false);
    const previewImage = ref("");
    const previewTitle = ref("");

    // Estado reactivo para el formulario
    const formState = reactive({
      ...props.product,
      gallery: props.product?.gallery || []
    });

    // Watcher para actualizar el formState cuando cambia la prop product
    watch(
      () => props.product,
      (newProduct) => {
        if (!newProduct) return;
        
        Object.assign(formState, {
          ...newProduct,
          gallery: newProduct.gallery || []
        });
        
        galleryFiles.value = (newProduct.gallery || []).map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}.jpg`,
          status: "done",
          url: url,
        }));
      },
      { immediate: true, deep: true }
    );

    const beforeUpload = () => true;

    const dummyUpload = ({ onSuccess }) => {
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    };

    const handleGalleryChange = ({ fileList }) => {
      galleryFiles.value = fileList;
    };

    const handlePreview = async (file) => {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }
      previewImage.value = file.url || file.preview;
      previewVisible.value = true;
      previewTitle.value =
        file.name || file.url.substring(file.url.lastIndexOf("/") + 1);
    };

    const handlePreviewCancel = () => {
      previewVisible.value = false;
      previewTitle.value = "";
    };

    const handleSubmit = () => {
      formRef.value.validate().then(() => {
        confirmLoading.value = true;

        const productData = {
          ...formState,
          gallery: galleryFiles.value
            .filter((file) => file.status === "done")
            .map((file) => file.url || file.response?.url),
        };

        emit("submit", productData);
        confirmLoading.value = false;
      }).catch((error) => {
        console.log("Validation error:", error);
        message.error("Por favor complete todos los campos requeridos");
      });
    };

    const handleCancel = () => {
      formRef.value.resetFields();
      emit("cancel");
    };

    return {
      formRef,
      formState,
      confirmLoading,
      rules: {
        name: [{ required: true, message: "Ingrese el nombre", trigger: "blur" }],
        sku: [{ required: true, message: "Ingrese el SKU", trigger: "blur" }],
        basePrice: [
          { required: true, message: "Ingrese el precio", trigger: "blur" },
          { 
            validator: (_, value) => value >= 0, 
            message: "El precio no puede ser negativo",
            trigger: "blur"
          }
        ],
      },
      galleryFiles,
      previewVisible,
      previewImage,
      previewTitle,
      beforeUpload,
      dummyUpload,
      handleGalleryChange,
      handlePreview,
      handlePreviewCancel,
      handleSubmit,
      handleCancel,
    };
  },
};
</script>