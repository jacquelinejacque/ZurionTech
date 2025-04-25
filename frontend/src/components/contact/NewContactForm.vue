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
        name: "",
        phone: "",
        email :"",
        password: "",
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
    (this.toastElement = new Toast(document.getElementById("newUser-toast")))
    
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
        this.loading = true;

        const submitData = {
          ...this.formData,
        };

        console.log("Submitting data:", submitData);

        const res = await axios.post(`${Const.BASE_URL}users/create`, submitData, {
          headers: { "access-token": localStorage.getItem("accessToken") },
        });

        if (res.data.status === 200) {
          console.log(res.data);
          this.showToast("User Contact successfully created", false);
          this.$emit('contact-added');
          this.resetForm();
        } else {
          const message =
            res.data.error || res.data.message || "Failed to create User Contact";
          this.showToast(message, true);
        }
      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to create User Contact, please try again";
        this.showToast(message, true);
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.formData = {
        name: "",
        phone: "",
        email : "",
        idNumber: "",
        dateOfBirth: "",
        gender: "",
        organisation : "",
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
          <h5 class="modal-title">New Contact</h5>
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
                v-model="formData.name"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                v-model="formData.password"
              />
            </div>

            <div class="col-md-6 mb-3">
              <label for="phone" class="form-label">Phone Number</label>
              <input
                type="tel"
                class="form-control"
                id="phone"
                v-model="formData.phone"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                type="text"
                class="form-control"
                id="email"
                v-model="formData.email"
              />
            </div>            
            <div class="col-md-6 mb-3">
              <label for="idNumber" class="form-label">Id Number</label>
              <input
                type=""
                class="form-control"
                id="idNumber"
                v-model="formData.idNumber"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="dateOfBirth" class="form-label">Date of Birth</label>
             
              <input
                v-model="formData.dateOfBirth"
                type="date"
                id="invoice-date"
                class="form-control"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="gender" class="form-label">Gender</label>
              <select
                class="form-control"
                id="gender"
                v-model="formData.gender"
              >
                <option disabled value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer Not Say">Prefer Not Say</option>
              </select>
            </div>


            <div class="col-md-6 mb-3">
              <label for="organisation" class="form-label">Organisation</label>
              <input
                type="organisation"
                class="form-control"
                id="organisation"
                v-model="formData.organisation"
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