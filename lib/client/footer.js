module.exports = {
  name: "dsh-sidebar",
  inject: ["slots"],
  apply(ctx) {
    const slots = ctx.get("slots");
    if (slots === void 0) return;
    ctx.effect(() => slots.inject("settings.section", () => slots.register(
      { name: "settings.section", id: "dsh-editor", order: 25, label: "编辑器" },
      () => React.createElement(EditorSettingsSection)
    )));
    ctx.effect(() => slots.inject("conversation.session.header.actions", () => slots.register(
      { name: "conversation.session.header.actions", id: "dsh-sidebar", order: 50 },
      (props) => React.createElement(SidebarPanel, props)
    )));
  }
};
return module.exports; } });
