<template>
  <div class="ru-card">
    <div class="ru-card-body" :style="bodyStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'RuCard',

    props: ['bodyStyle']
  };
</script>

<style scoped lang="scss">
  .ru-card {
    border: 1px solid #ebeef5;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    color: #303133;
    overflow: hidden;
  }

  .ru-card-body {
    padding: 15px;
  }
</style>
