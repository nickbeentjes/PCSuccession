namespace PCSuccessionAgent.UI;

partial class StatusForm : Form
{
    private Label lblStatus;
    private Label lblLastSync;
    private Label lblItemsDiscovered;
    private Button btnRefresh;
    private Button btnClose;

    public StatusForm()
    {
        InitializeComponent();
        LoadStatus();
    }

    private void InitializeComponent()
    {
        this.Text = "PC Succession Agent - Status";
        this.Size = new Size(500, 400);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.FormBorderStyle = FormBorderStyle.FixedDialog;
        this.MaximizeBox = false;
        this.MinimizeBox = false;

        var mainPanel = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            RowCount = 5,
            Padding = new Padding(20)
        };

        // Status
        mainPanel.Controls.Add(new Label { Text = "Status:", Font = new Font("Segoe UI", 10, FontStyle.Bold), AutoSize = true }, 0, 0);
        lblStatus = new Label { Text = "Loading...", AutoSize = true };
        mainPanel.Controls.Add(lblStatus, 1, 0);

        // Last Sync
        mainPanel.Controls.Add(new Label { Text = "Last Sync:", Font = new Font("Segoe UI", 10, FontStyle.Bold), AutoSize = true }, 0, 1);
        lblLastSync = new Label { Text = "Loading...", AutoSize = true };
        mainPanel.Controls.Add(lblLastSync, 1, 1);

        // Items Discovered
        mainPanel.Controls.Add(new Label { Text = "Items Discovered:", Font = new Font("Segoe UI", 10, FontStyle.Bold), AutoSize = true }, 0, 2);
        lblItemsDiscovered = new Label { Text = "Loading...", AutoSize = true };
        mainPanel.Controls.Add(lblItemsDiscovered, 1, 2);

        // Buttons
        var buttonPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Bottom,
            FlowDirection = FlowDirection.RightToLeft,
            Height = 50,
            Padding = new Padding(10)
        };

        btnClose = new Button { Text = "Close", Size = new Size(80, 30) };
        btnClose.Click += (s, e) => this.Close();
        buttonPanel.Controls.Add(btnClose);

        btnRefresh = new Button { Text = "Refresh", Size = new Size(80, 30) };
        btnRefresh.Click += (s, e) => LoadStatus();
        buttonPanel.Controls.Add(btnRefresh);

        this.Controls.Add(mainPanel);
        this.Controls.Add(buttonPanel);
    }

    private async void LoadStatus()
    {
        try
        {
            lblStatus.Text = "Loading...";
            lblLastSync.Text = "Loading...";
            lblItemsDiscovered.Text = "Loading...";

            await Task.Delay(100); // Simulate loading

            // TODO: Load actual status from services
            lblStatus.Text = "Active - Monitoring";
            lblLastSync.Text = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            lblItemsDiscovered.Text = "0 applications, 0 files";
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error loading status: {ex.Message}", "Error", 
                MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}

