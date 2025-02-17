<script>
import { Const } from "@/utils/constants";
import axios from "axios";
import Toastify from "toastify-js";
import { Toast } from "bootstrap/dist/js/bootstrap.bundle";

export default {
  data() {
    return {
      routes: null,
      userType: null,
      formData: {
        fullName: "",
        phoneNumber: "",
        idNumber : "",
        dateOfBirth: "",
        gender: "",
        organisation: "",
      },
      loading: false,
      formSubmitted: false,
      toastElement: null,
    };
  },

  mounted() {
    (this.toastElement = new Toast(document.getElementById("newUser-toast"))),
      this.getRoutes();
    this.getUserType();
  },

  methods: {
    showToast(message, isDanger) {
      Toastify({
        text: message,
        style: {
          background: isDanger ? "#d63939" : "#2fb344",
        },
      }).showToast();
    },
    async handleSubmit() {
      try {
        const selectedUserType = this.userType.find(
          (user) => user.userTypeId === this.formData.userType
        );

        if (!selectedUserType) {
          this.showToast("Invalid user type selected.", true);
          return;
        }

        if (selectedUserType.requiresRoutes && this.formData.channels.length === 0) {
          this.showToast(
            "Please select a route before submitting for this user type.",
            true
          );
          return;
        }

        // Ensure all fields are filled
        if (!this.formData.name || !this.formData.phoneNumber || !this.formData.email) {
          this.showToast("Please fill all required fields.", true);
          return;
        }

        this.loading = true;

        // Transform channels if required
        const submitData = {
          ...this.formData,
          channels: this.formData.channels.map((channel) => ({
            channelId: channel,
          })),
        };

        console.log("Submitting data:", submitData);

        const res = await axios.post(`${Const.BASE_URL}stock/add`, submitData, {
          headers: { "access-token": localStorage.getItem("accessToken") },
        });

        if (res.data.status === 10001) {
          this.showToast("StockItem successfully created", false);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          const message = res.data.message || "Failed to create stock Item";
          this.showToast(message, true);
        }
      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        const message =
          error.response?.data?.message || "Failed to create stockItem, please try again";
        this.showToast(message, true);
      } finally {
        this.loading = false;
      }
    },


    resetForm() {
      this.formData = {
        name: "",
        category: "",
        description : "",
        quantity: "",
        price: "",
        status: "",
      };

      this.formSubmitted = true;
    },
  },
};
</script>

<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">New Stock</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="fullName" class="form-label">Full Name</label>
              <input
                type="text"
                class="form-control"
                id="fullName"
                v-model="formData.fullName"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="phoneNumber" class="form-label">Phone Number</label>
              <input
                type="tel"
                class="form-control"
                id="phoneNumber"
                v-model="formData.phoneNumber"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="idNumber" class="form-label">Id Number</label>
              <input
                type=""
                class="form-control"
                id="idNumber"
                v-model="formData.idNumber"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="dateOfBirth" class="form-label">Date of Birth</label>
              <input
                type="text"
                class="form-control"
                id="dateOfBirth"
                v-model="formData.dateOfBirth"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="gender" class="form-label">Gender</label>
              <input
                type=""
                class="form-control"
                id="gender"
                v-model="formData.gender"
                required
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="organisation" class="form-label">Organisatio</label>
              <input
                type="organisation"
                class="form-control"
                id="organisation"
                v-model="formData.organisation"
                required
              />
            </div>

          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn me-auto" data-bs-dismiss="modal">Close</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">Submitting...</span>
            <span v-if="!loading">Submit</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style>
.form {
  display: flex;
  flex-direction: column;
}
</style>