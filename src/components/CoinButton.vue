<!--
描述：投币按钮组件
作者：焦佳宇
-->

<template>
  <div>
    <span style="text-align: left; margin-right: 8px" v-if="is_coined == false">
      <img
        src="../assets/dollar.png"
        :style="{ height: this.icon_size + 'px' }"
        @click="coinConfirm"
      />
    </span>
    <span style="text-align: left; margin-right: 8px" v-else>
      <img
        src="../assets/dollar_solid.png"
        :style="{ height: this.icon_size + 'px' }"
      />
    </span>
    <span
      :style="{ 'text-align': 'left', 'font-size': this.size }"
      v-if="this.show_num == true"
    >
      {{ coin_nums }}
    </span>
  </div>
  <el-dialog v-model="input_nums" title="请选择投币数">
    <el-input-number
      min="1"
      max="3"
      v-model="this.coin_in_num"
      :precision="0"
    ></el-input-number>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="input_nums = false">我再想想</el-button>
        <el-button type="primary" @click="coinIn">确认投币</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";
export default {
  /*
    type: 0-动态、1-回答
    content_id:要操作的内容的id
    show_num:是否展示数字
    size:尺寸
    */
  props: ["content_type", "content_id", "show_num", "size"],
  components: {
    ElMessage,
  },
  data() {
    return {
      is_coined: false,
      dynamic_type: "",
      coin_nums: "",
      input_nums: false,
      coin_in_num: 1,
      icon_size: 0,
    };
  },
  methods: {
    coinConfirm() {
      //判断是否登录
      if (this.$store.state.is_login == false) {
        //若未登录
        ElMessage({
          message: "请先登录",
          type: "warning",
          showClose: true,
          duration: 2000,
        });
        /**之后此处需记录当前页面路径，以便于登陆完成后跳转 */
        this.$router.push({
          path: "/login",
          query: { redirect: this.$route.fullPath },
        });
      } else {
        //呼出选择币数框
        this.input_nums = true;
      }
    },
    coinIn() {
      //判断输入是否为合法类型-number
      if (typeof this.coin_in_num != "number") {
        ElMessage({
          type: "error",
          message: "请输入合法值",
          duration: 2000,
          showClose: true,
        });
        return;
      }
      this.input_nums = false;

      axios
        .post("/api/coin/" + this.dynamic_type, {
          user_id: this.$store.state.user_info.user_id,
          [this.dynamic_type + "_id"]: this.content_id,
          num: this.coin_in_num,
        })
        .then((res) => {
          if (res.data.status) {
            this.is_coined = true;
            this.coin_nums += this.coin_in_num;
            this.coin_in_num = 1;
            this.$emit("giveCoin", true);
          } else {
            var errMsg = "";
            if (res.data.data.error == 2) {
              errMsg = "不能给自己投币！";
            } else {
              errMsg =
                "鸟币不足,当前余额为 " + res.data.data.user_coin_left + " 枚";
            }
            ElMessage({
              type: "warning",
              message: errMsg,
              duration: 2000,
              showClose: true,
            });
            this.$emit("giveCoin", false);
          }
        })
        .catch((errMsg) => {
          alert(
            "对id为" +
              this.content_id +
              "的" +
              this.dynamic_type +
              "投币，相关API此时未完成"
          );
          console.log(errMsg);
        });
    },
  },
  updated() {
    //查询是否投过币
    if (this.$store.state.is_login) {
      axios
        .get(
          "/api/coin/" +
            this.dynamic_type +
            "?user_id=" +
            this.$store.state.user_info.user_id +
            "&" +
            this.dynamic_type +
            "_id=" +
            this.content_id
        )
        .then((res) => {
          if (this.dynamic_type == "blog") {
            this.coin_nums = res.data.data.blog_coin;
          } else {
            this.coin_nums = res.data.data.answer_coin;
          }
          this.is_coined = res.data.status;
        })
        .catch((errMsg) => {
          console.log(errMsg);
        });
    } else {
      //查询投币个数
      axios
        .get(
          "/api/coin/" +
            this.dynamic_type +
            "?user_id=" +
            1 +
            "&" +
            this.dynamic_type +
            "_id=" +
            this.content_id
        )
        .then((res) => {
          if (this.dynamic_type == "blog") {
            this.coin_nums = res.data.data.blog_coin;
          } else {
            this.coin_nums = res.data.data.answer_coin;
          }
          this.is_coined = false;
        })
        .catch((errMsg) => {
          console.log(errMsg);
        });
    }
  },
  created() {
    //设定大小
    switch (this.size) {
      case "xx-small":
        this.icon_size = 9;
        break;
      case "x-small":
        this.icon_size = 10;
        break;
      case "small":
        this.icon_size = 12;
        break;
      case "normal":
        this.icon_size = 14;
        break;
      case "large":
        this.icon_size = 17;
        break;
      case "x-large":
        this.icon_size = 24;
        break;
      case "xx-large":
        this.icon_size = 30;
        break;
    }
    //动态改变url
    switch (this.content_type) {
      case "0":
        this.dynamic_type = "blog";
        break;
      case "1":
        this.dynamic_type = "answer";
        break;
    }
    console.log("11111", this.dynamic_type);
    //查询是否投过币
    if (this.$store.state.is_login) {
      axios
        .get(
          "api/coin/" +
            this.dynamic_type +
            "?user_id=" +
            this.$store.state.user_info.user_id +
            "&" +
            this.dynamic_type +
            "_id=" +
            this.content_id
        )
        .then((res) => {
          if (this.dynamic_type == "blog") {
            this.coin_nums = res.data.data.blog_coin;
          } else {
            this.coin_nums = res.data.data.answer_coin;
          }
          this.is_coined = res.data.status;
        })
        .catch((errMsg) => {
          console.log(errMsg);
        });
    } else {
      //查询投币个数
      axios
        .get(
          "api/coin/" +
            this.dynamic_type +
            "?user_id=" +
            1 +
            "&" +
            this.dynamic_type +
            "_id=" +
            this.content_id
        )
        .then((res) => {
          if (this.dynamic_type == "blog") {
            this.coin_nums = res.data.data.blog_coin;
          } else {
            this.coin_nums = res.data.data.answer_coin;
          }
          this.is_coined = false;
        })
        .catch((errMsg) => {
          console.log(errMsg);
        });
    }
  },
};
</script>

<style></style>
