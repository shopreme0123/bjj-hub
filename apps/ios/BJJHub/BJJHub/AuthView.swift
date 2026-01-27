import SwiftUI

struct AuthView: View {
    @ObservedObject var viewModel: AppViewModel

    @State private var email = ""
    @State private var password = ""
    @State private var isAppearing = false

    var body: some View {
        let theme = BeltTheme(belt: .white)

        ZStack {
            // Elegant gradient background
            theme.backgroundGradient
                .ignoresSafeArea()

            // Subtle noise texture
            theme.subtleTexture
                .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo and title section
                VStack(spacing: 12) {
                    // BJJ Hub Logo with glow effect
                    ZStack {
                        Circle()
                            .fill(theme.meshGradient)
                            .frame(width: 96, height: 96)
                            .glowEffect(color: theme.primary, radius: 32)

                        Image(systemName: "figure.martial.arts")
                            .font(.system(size: 42, weight: .bold))
                            .foregroundStyle(.white)
                    }
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : -30)
                    .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.1), value: isAppearing)

                    VStack(spacing: 6) {
                        Text("BJJ Hub")
                            .font(.display(32, weight: .heavy))
                            .foregroundStyle(theme.textPrimary)

                        Text("サインインして続ける")
                            .font(.body(14, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                    }
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : 20)
                    .animation(.easeOut(duration: 0.6).delay(0.3), value: isAppearing)
                }
                .padding(.bottom, 48)

                // Form section
                VStack(spacing: 16) {
                    // Email field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("メールアドレス")
                            .font(.caption(11))
                            .foregroundStyle(theme.textMuted)
                            .textCase(.uppercase)
                            .tracking(0.5)

                        TextField("", text: $email)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .keyboardType(.emailAddress)
                            .padding(14)
                            .background(theme.card)
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .stroke(theme.cardBorder, lineWidth: 1.5)
                            )
                            .subtleShadow()
                    }
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : 20)
                    .animation(.easeOut(duration: 0.5).delay(0.4), value: isAppearing)

                    // Password field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("パスワード")
                            .font(.caption(11))
                            .foregroundStyle(theme.textMuted)
                            .textCase(.uppercase)
                            .tracking(0.5)

                        SecureField("", text: $password)
                            .padding(14)
                            .background(theme.card)
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .stroke(theme.cardBorder, lineWidth: 1.5)
                            )
                            .subtleShadow()
                    }
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : 20)
                    .animation(.easeOut(duration: 0.5).delay(0.5), value: isAppearing)

                    // Error messages
                    if let error = viewModel.authErrorMessage {
                        Text(error)
                            .font(.caption(12))
                            .foregroundStyle(Color.red)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.top, 4)
                    }

                    if let debug = viewModel.authDebugMessage {
                        Text(debug)
                            .font(.caption(10))
                            .foregroundStyle(theme.textMuted)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    // Login button
                    Button(action: {
                        Task {
                            await viewModel.signIn(email: email, password: password)
                        }
                    }) {
                        ZStack {
                            if viewModel.isAuthenticating {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text("ログイン")
                                    .font(.title(16, weight: .bold))
                                    .tracking(0.5)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 54)
                        .foregroundStyle(.white)
                        .background(
                            ZStack {
                                theme.gradient
                                if !email.isEmpty && !password.isEmpty && !viewModel.isAuthenticating {
                                    theme.accentGlow
                                }
                            }
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .glowEffect(color: theme.primary.opacity(email.isEmpty || password.isEmpty ? 0 : 0.4), radius: 16)
                    }
                    .disabled(email.isEmpty || password.isEmpty || viewModel.isAuthenticating)
                    .opacity(email.isEmpty || password.isEmpty ? 0.5 : 1)
                    .scaleEffect(viewModel.isAuthenticating ? 0.98 : 1.0)
                    .animation(.easeInOut(duration: 0.2), value: viewModel.isAuthenticating)
                    .padding(.top, 8)
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : 20)
                    .animation(.spring(response: 0.6, dampingFraction: 0.8).delay(0.6), value: isAppearing)
                }
                .padding(.horizontal, 28)

                Spacer()
                Spacer()
            }
        }
        .onAppear {
            isAppearing = true
        }
    }
}
